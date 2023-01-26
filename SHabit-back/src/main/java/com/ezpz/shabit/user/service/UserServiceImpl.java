package com.ezpz.shabit.user.service;

import com.ezpz.shabit.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.ezpz.shabit.jwt.JwtTokenProvider;
import com.ezpz.shabit.user.dto.req.UserTestReqDto;
import com.ezpz.shabit.user.dto.res.UserTestResDto;
import com.ezpz.shabit.user.entity.Users;
import com.ezpz.shabit.user.enums.Authority;
import com.ezpz.shabit.util.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLDecoder;
import java.util.Collections;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
  private final UserRepository userRepository;

  private final PasswordEncoder passwordEncoder;
  private final JwtTokenProvider jwtTokenProvider;
  private final AuthenticationManagerBuilder authenticationManagerBuilder;
  private final RedisTemplate redisTemplate;

  private final S3File s3File;

  final String dirName = "profile";

  @Override
  public boolean checkEmail(String email) throws Exception {
    log.info("check email : {}", email);

    return userRepository.findByEmail(email).isPresent();
  }

  @Override
  public ResponseEntity<?> signUp(UserTestReqDto.SignUp signUp) {
    if (userRepository.existsByEmail(signUp.getEmail())) {
      return Response.badRequest("이미 회원가입된 이메일입니다.");
    }

    Users users = Users.builder()
                          .email(signUp.getEmail())
                          .nickname(signUp.getNickname())
                          .password(passwordEncoder.encode(signUp.getPassword()))
                          .roles(Collections.singletonList(Authority.ROLE_USER.name()))
                          .build();

    userRepository.save(users);

    return Response.ok("회원가입에 성공하였습니다.");

  }

  @Override
  public ResponseEntity<?> login(UserTestReqDto.Login login) {

    if (userRepository.findByEmail(login.getEmail()).orElse(null) == null) {
      return Response.badRequest("해당하는 유저가 존재하지 않습니다.");
    }

    UsernamePasswordAuthenticationToken authenticationToken = login.toAuthentication();

    Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

    UserTestResDto.TokenInfo tokenInfo = jwtTokenProvider.generateToken(authentication);
    UserTestResDto.UserInfo userInfo = new UserTestResDto.UserInfo();

    Users users = userRepository.findUserByEmail(login.getEmail());

    UserTestResDto.LoginUserRes loginUserRes =
            UserTestResDto.LoginUserRes.builder()
                    .email(users.getEmail())
                    .nickname(users.getNickname())
                    .theme(users.getTheme())
                    .profile(users.getProfile())
                    .build();

    userInfo.setToken(tokenInfo);
    userInfo.setUser(loginUserRes);

    redisTemplate.opsForValue()
            .set("RT:" + authentication.getName(), tokenInfo.getRefreshToken(), tokenInfo.getRefreshTokenExpirationTime(), TimeUnit.MILLISECONDS);

    return Response.makeResponse(HttpStatus.OK, "로그인에 성공했습니다.", 0, userInfo);
  }

  public ResponseEntity<?> logout(UserTestReqDto.Logout logout) {
    // 1. Access Token 검증
    if (!jwtTokenProvider.validateToken(logout.getAccessToken())) {
      return Response.badRequest("잘못된 요청입니다.");
    }

    // 2. Access Token 에서 User email 을 가져옵니다.
    Authentication authentication = jwtTokenProvider.getAuthentication(logout.getAccessToken());

    // 3. Redis 에서 해당 User email 로 저장된 Refresh Token 이 있는지 여부를 확인 후 있을 경우 삭제합니다.
    if (redisTemplate.opsForValue().get("RT:" + authentication.getName()) != null) {
      // Refresh Token 삭제
      redisTemplate.delete("RT:" + authentication.getName());
    }

    // 4. 해당 Access Token 유효시간 가지고 와서 BlackList 로 저장하기
    Long expiration = jwtTokenProvider.getExpiration(logout.getAccessToken());
    redisTemplate.opsForValue()
            .set(logout.getAccessToken(), "logout", expiration, TimeUnit.MILLISECONDS);

    return Response.ok("로그아웃 되었습니다.");
  }

  @Override
  public ResponseEntity<?> reissue(UserTestReqDto.Reissue reissue) {
    // 1. Refresh Token 검증
    if (!jwtTokenProvider.validateToken(reissue.getRefreshToken())) {
      return Response.badRequest("Refresh Token 정보가 유효하지 않습니다.");
    }

    // 2. Access Token 에서 User email 을 가져옵니다.
    Authentication authentication = jwtTokenProvider.getAuthentication(reissue.getAccessToken());

    // 3. Redis 에서 User email 을 기반으로 저장된 Refresh Token 값을 가져옵니다.
    String refreshToken = (String) redisTemplate.opsForValue().get("RT:" + authentication.getName());
    // (추가) 로그아웃되어 Redis 에 RefreshToken 이 존재하지 않는 경우 처리
    if (ObjectUtils.isEmpty(refreshToken)) {
      return Response.badRequest("잘못된 요청입니다.");
    }
    if (!refreshToken.equals(reissue.getRefreshToken())) {
      return Response.badRequest("Refresh Token 정보가 일치하지 않습니다.");
    }

    // 4. 새로운 토큰 생성
    UserTestResDto.TokenInfo tokenInfo = jwtTokenProvider.generateToken(authentication);

    // 5. RefreshToken Redis 업데이트
    redisTemplate.opsForValue()
            .set("RT:" + authentication.getName(), tokenInfo.getRefreshToken(), tokenInfo.getRefreshTokenExpirationTime(), TimeUnit.MILLISECONDS);

    return Response.makeResponse(HttpStatus.OK, "토큰 재발급을 성공하였습니다.", 0, tokenInfo);
  }

  @Override
  public ResponseEntity<?> getUserInfo(String email) {

    if (userRepository.findByEmail(email).orElse(null) == null)
      return Response.badRequest("해당하는 유저가 존재하지 않습니다.");

    Users users = userRepository.findUserByEmail(email);

    UserTestResDto.LoginUserRes loginUserRes =
            UserTestResDto.LoginUserRes.builder()
                    .email(users.getEmail())
                    .nickname(users.getNickname())
                    .theme(users.getTheme())
                    .profile(users.getProfile())
                    .build();

    return Response.makeResponse(HttpStatus.OK, "회원 정보 요청을 성공하였습니다.", 0, loginUserRes);
  }

  @Override
  @Transactional
  public void updatePassword(String email, String password) throws Exception {
    log.info("email : {}, password : {}", email, password);
    Users user = userRepository.findByEmail(email).orElseThrow();
    log.info("before user : {}", user);

    user.setPassword(passwordEncoder.encode(password));
    userRepository.save(user);
    log.info("after user : {}", user);
  }

  @Override
  @Transactional
  public boolean changePassword(String email, String curPassword, String changePassword) throws Exception {
    // 현재 비밀번호와 다른지 확인
    Users user = userRepository.findByEmail(email).orElseThrow();
    // 입력으로 들어온 비밀번호와 현재 비밀번호가 같다면
    if (passwordEncoder.matches(curPassword, user.getPassword())) {
      // 비밀번호 변경
      user.setPassword(passwordEncoder.encode(changePassword));
      userRepository.save(user);
      log.info("userService: 비밀번호 변경 성공");
      return true;
    }
    // 현재 비밀번호와 다르다면
    else {
      // 비밀번호 변경 불가
      log.info("userService: 현재 비밀번호와 불일치");
      return false;
    }
  }

  @Override
  @Transactional
  public String updateProfile(String email, MultipartFile profile) throws Exception {
    Users user = userRepository.findByEmail(email).orElseThrow();
    // 등록되어있는 프로필 사진이 있다면 삭제
    String profileUrl = user.getProfile();
    if (profileUrl != null) {
      s3File.delete(profileUrl);
    }

    String url = s3File.upload(profile, dirName, email);
    log.info("profile image uploaded successfully");
    user.setProfile(url);
    userRepository.save(user);
    log.info("user info changed successfully");

    return url;
  }


  @Override
  public void changeThema(String email, int theme) throws Exception {
    Users user = userRepository.findByEmail(email).orElseThrow();
    user.setTheme(theme);
    userRepository.save(user);
  }

  @Override
  public void updateNickname(String email, String nickname) throws Exception {
    log.info("email : {}, nickname : {}", email, nickname);
    Users user = userRepository.findByEmail(email).orElseThrow();
    log.info("before update user : {}", user);
    user.setNickname(nickname);
    userRepository.save(user);
    log.info("after update user : {}", user);
  }
}