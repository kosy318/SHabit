import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { theme } from '../../styles/GlobalStyles';

const Button = ({
  bg,
  role,
  size,
  text,
  color,
  shadow,
  border,
  onClick,
  children,
}) => {
  const bgClass = `bg-${bg}`;

  return (
    <ButtonWrapper
      type={role}
      className={`${bgClass} ${size} ${shadow} ${border} ${color}`}
      onClick={onClick}
    >
      <Text>{text}</Text>
      {children}
    </ButtonWrapper>
  );
};

Button.propTypes = {
  bg: PropTypes.oneOf(['primary', 'secondary', 'white', 'black']),
  role: PropTypes.oneOf(['button', 'submit']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  text: PropTypes.string,
  color: PropTypes.oneOf([
    'primary',
    'secondary',
    'white',
    'blue',
    'yellow',
    'green',
    'gray',
  ]),
  shadow: PropTypes.oneOf(['shadow']),
  border: PropTypes.oneOf(['rounded', 'main', 'tab']),
  onClick: PropTypes.func,
  children: PropTypes.element,
};

Button.defaultProps = {
  bg: undefined,
  role: 'button',
  size: 'sm',
  text: '',
  shadow: undefined,
  border: undefined,
  onClick: undefined,
  children: undefined,
};

const ButtonWrapper = styled.button`
  background-color: ${theme.color.whiteColor};
  border-radius: 0.3rem;
  padding: 0.7rem;
  font-weight: bold;

  &.primary {
    color: ${theme.color.primary};
  }

  &.secondary {
    color: ${theme.color.secondary};
  }

  &.white {
    color: ${theme.color.whiteColor};
  }

  &.gray {
    color: ${theme.color.grayColor};
  }

  &.blue {
    color: ${theme.color.blueColor};
  }

  &.yellow {
    color: ${theme.color.yellowColor};
  }

  &.green {
    color: ${theme.color.greenColor};
  }

  &.bg-primary {
    background-color: ${theme.color.primary};
  }

  &.bg-secondary {
    background-color: ${theme.color.secondary};
  }

  &.bg-white {
    background-color: ${theme.color.whiteColor};
  }

  &.bg-black {
    background-color: ${theme.color.blackColor};
  }

  &.xs {
    font-size: 0.7rem;
  }

  &.md {
    font-size: 1.5rem;
  }

  &.lg {
    font-size: 3rem;
  }

  &.shadow {
    box-shadow: 0 0.2rem 0.5rem ${theme.color.lightGrayColor};
  }

  &.tab {
    border-radius: 1.5rem 1.5rem 0 0;
  }
`;

const Text = styled.span`
  text-align: center;
`;

export default Button;
