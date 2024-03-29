import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import notify from '../../utils/notify';

import { setVideoList } from '../../store/videoSlice';
import { ImExit } from 'react-icons/im';
import {
  CgTimer,
  CgSandClock,
  CgPlayPause,
  CgPlayButton,
  CgRedo,
} from 'react-icons/cg';
import { setInitLogArray, setVideoModal } from '../../store/trackingSlice';
import { setStretchingMode, setStretchModal } from '../../store/videoSlice';
import { postData } from '../../services/stat/post';
import { useNavigate } from 'react-router-dom';
import { setMode,setTmp } from '../../store/modeSlice';
import { setInitStretchingTime } from '../../store/timeSlice';
import { setVideoSetting } from '../../store/modeSlice';
import { setSelected } from '../../store/videoSlice';
import { fetchVods } from '../../services/info/get';
import { typedUseSelector } from '../../store';

const Sidebar = () => {
  const [toggle, setToggle] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initStretchingMin = useSelector((state) => {
    return state.admin.stretchingTime / 60;
  });
  const stretchingMin = useSelector((state) => {
    return state.time.stretchTime.min;
  });
  const stretchingSec = useSelector((state) => {
    return state.time.stretchTime.sec;
  });
  const pose = useSelector((state) => {
    return state.pose.pose;
  });
  const logArray = useSelector((state) => {
    return state.tracking.logArray;
  });
  const userEmail = useSelector((state) => {
    return state.auth.user.email;
  });
  const stretchMode = useSelector((state) => {
    return state.video.stretchingMode;
  });
  const curPose = useSelector((state) => {
    return state.pose.pose;
  });
  const settingLog = useSelector((state) => {
    return state.tracking.settingLog;
  });
  const user = JSON.parse(sessionStorage.getItem('user'));
  const tmp = useSelector((state) => {
    return state.mode.tmp;
  });
  useEffect(() => {
    if (stretchingMin === 0 && stretchingSec === 0) {
      dispatch(setMode('pausedLive'));
      dispatch(setTmp(true));
      dispatch(setInitStretchingTime(initStretchingMin));
    }
  }, [stretchingMin, stretchingSec]);
  useEffect(() => {
    if (settingLog && tmp) {
      postData(user.email, logArray).then(() => {
        setInitLogArray();
        fetchVods(user.email).then((res) => {
          dispatch(setVideoList(res));
          // console.log(res);
          dispatch(setStretchModal(true));
        });
      });
      dispatch(setTmp(false));
      notify('stretching');
      // TODO 스트레칭 시간 setting
      dispatch(setInitStretchingTime(initStretchingMin));
    }
  }, [settingLog]);
  useEffect(() => {
    dispatch(setInitStretchingTime(initStretchingMin));
  }, []);
  const usedTime = useSelector((state) => {
    return `${state.time.usedTime.hour}시간 ${state.time.usedTime.min}분`;
  });
  const usedMin = useSelector((state) => {
    return state.time.usedTime.min;
  });
  const stretchingTime = `${stretchingMin}분 ${stretchingSec}초`;
  // 방 나가기 버튼 누를 때
  const clickStop = () => {
    // 선택된 비디오 리덕스에서 제거
    dispatch(setSelected(null));
    // 시간 같은거 모두 정지
    dispatch(setMode('stopLive'));
    dispatch(setVideoSetting(false));
    // 모달 띄워서 내 모습 play + download
    dispatch(setVideoModal(true));
    // TODO api날리기 stat post
    if (usedMin > 1) {
      postData(userEmail, logArray).then(() => {
        setInitLogArray();
      });
    } else {
      setInitLogArray();
    }
  };
  const clickPlayButton = () => {
    dispatch(setMode('startLive'));
    setToggle(!toggle);
  };
  const clickPauseButton = () => {
    dispatch(setMode('pausedLive'));
    setToggle(!toggle);
  };

  // 돌아가기 버튼 누를 때 TODO 라이브 모드로 변경
  const goToLive = () => {
    dispatch(setStretchModal(false));
    dispatch(setStretchingMode(false));
    dispatch(setMode('startLive'));
    dispatch(setSelected(null));
    navigate('/posture/live');
  };
  return (
    <ContainerWrapper>
      {stretchMode ? (
        <IconWrapper>
          <CgRedo onClick={goToLive} />
          <Text>돌아가기</Text>
        </IconWrapper>
      ) : (
        <TimeContainer>
          <IconWrapper>
            <CgTimer />
            <Text>총 이용 시간</Text>
            <Text>{usedTime}</Text>
          </IconWrapper>
          <IconWrapper>
            <CgSandClock />
            <Text>스트레칭 시간</Text>
            <Text>{stretchingTime}</Text>
          </IconWrapper>
        </TimeContainer>
      )}
      <CapturingContainer>
        {toggle && curPose && (
          <IconWrapper>
            <CgPlayPause onClick={clickPauseButton} />
            <Text>일시정지</Text>
          </IconWrapper>
        )}
        {!toggle && curPose && (
          <IconWrapper>
            <CgPlayButton onClick={clickPlayButton} />
            <Text>시작</Text>
          </IconWrapper>
        )}
        {curPose && (
          <IconWrapper>
            <ImExit onClick={clickStop} />
            <Text>종료하기</Text>
          </IconWrapper>
        )}
      </CapturingContainer>
    </ContainerWrapper>
  );
};
export default Sidebar;

const ContainerWrapper = styled.div`
  width: 8rem;
  height: 36rem;
  background-color: ${(props) => props.theme.color.primary};
  border-radius: 0 1.5rem 1.5rem 0;
  box-shadow: 0 0.1rem 0.2rem ${(props) => props.theme.color.grayColor};
  color: ${(props) => props.theme.color.whiteColor};

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 3rem 0;
`;
const TimeContainer = styled.div``;
const CapturingContainer = styled.div`
  & > div {
    & > svg {
      transition: all 0.2s ease-in-out;
      &:hover {
        cursor: pointer;
        transform: scale(1.1);
      }
    }
  }
`;

const IconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 2rem;
  margin: 1.5rem 0;
`;
const Text = styled.div`
  font-size: 0.9rem;
  margin: 0.1rem 0;
`;
