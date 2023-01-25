import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/GlobalStyles';

import ThemeBox from './ThemeBox';
import Logo from '../common/Logo';

export default function UserInfo() {
  return (
    <Wrapper>
      <ImgWrapper>
        <Logo color={'pink'} />
      </ImgWrapper>

      <ContentWrapper>
        <UserName>
          <span>USERNAME</span>
          <span>이메일 :asdfasfsdfasdfaezpz@gmail.com</span>
        </UserName>
        <LastLogin>마지막 접속일 : 2022.11.12</LastLogin>
        <ThemeBox />
      </ContentWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const ImgWrapper = styled.div`
  width: 7.5rem;
  height: 7.5rem;
  border-radius: 50%;
  background-color: ${theme.color.secondary};

  display: flex;
  align-items: center;
  justify-content: center;

  position: absolute;
  top: 4%;
  left: 7%;
`;

const ContentWrapper = styled.div`
  padding: 1rem;
  border-radius: 1.5rem;
  border: 0.2rem solid ${theme.color.secondary};
  box-shadow: 0 0.1rem 0.5rem ${theme.color.grayColor};
`;

const UserName = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0 1rem;
  margin: 0.3rem 0;

  & > span:first-child {
    font-size: 1.2rem;
    font-weight: bold;
  }
`;

const LastLogin = styled.div`
  padding: 0.3rem;
  margin: 0.7rem;
  color: ${theme.color.primary};
  font-weight: bold;
  border-radius: 0.5rem;
  border: 0.2rem solid ${theme.color.secondary};
  box-shadow: 0 0.1rem 0.5rem ${theme.color.grayColor};
`;
