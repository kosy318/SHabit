import React from 'react';
import styled from 'styled-components';

import Img from '../atoms/Img';
import Icon from '../atoms/Icon';
import Logo from '../atoms/Logo';
import Text from '../atoms/Text';

import { TbArrowBigRightLine } from 'react-icons/tb';

const Introduction = () => {
  return (
    <ContentWrapper>
      <TextWrapper>
        <Text text={'자세 교정을 위한 맞춤형 솔루션'} color={'white'} />
        <Logo size={'lg'} />
      </TextWrapper>
      <ImgWrapper>
        <Img assets={true} size={'lg'} src={'/assets/posture-bad.png'} />
        <Icon icon={<TbArrowBigRightLine />} size={'lg'} color={'white'} />
        <Img assets={true} size={'lg'} src={'/assets/posture-good.png'} />
      </ImgWrapper>
    </ContentWrapper>
  );
};

const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
`;

const TextWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 2rem;
`;

const ImgWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default Introduction;
