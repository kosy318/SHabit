import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { theme } from '../../styles/GlobalStyles';

const Label = ({ size, text, color, bg, onClick, children }) => {
  const bgClass = `bg-${bg}`;

  return (
    <LabelWrapper className={`${size} ${bgClass} } ${color}`} onClick={onClick}>
      {children}
      <Text>{text}</Text>
    </LabelWrapper>
  );
};

Label.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  text: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['primary', 'secondary', 'white', 'gray', 'red']),
  background: PropTypes.oneOf(['primary', 'secondary', 'white']),
  children: PropTypes.element,
  onClick: PropTypes.func,
};

Label.defaultProps = {
  size: 'sm',
  text: '',
  background: undefined,
  color: undefined,
  children: undefined,
  onClick: undefined,
};

const LabelWrapper = styled.label`
  background-color: transparent;
  font-weight: 600;

  &:hover {
    cursor: pointer;
  }

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

  &.red {
    color: ${theme.color.redColor};
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

  &.shadow {
    box-shadow: 0.2rem 0.2rem 0.2rem ${theme.color.lightGrayColor};
  }

  &.xs {
    font-size: 0.7rem;
  }

  &.sm {
    font-size: 0.9rem;
  }

  &.md {
    font-size: 1.5rem;
  }

  &.lg {
    font-size: 2rem;
  }
`;

const Text = styled.span`
  text-align: center;
`;

export default Label;
