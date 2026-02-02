import * as React from 'react';
import {
  createPresenceComponent,
  motionTokens,
} from '@fluentui/react-motion';

const FadeIn = createPresenceComponent({
  enter: {
    keyframes: [
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
    duration: motionTokens.durationNormal,
    easing: motionTokens.curveDecelerateMid,
  },
  exit: {
    keyframes: [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-8px)' },
    ],
    duration: motionTokens.durationFast,
    easing: motionTokens.curveAccelerateMid,
  },
});

interface IMotionWrapperProps {
  visible: boolean;
  children: React.ReactNode;
}

export const MotionWrapper: React.FC<IMotionWrapperProps> = ({ visible, children }) => {
  return (
    <FadeIn visible={visible}>
      <div>{children}</div>
    </FadeIn>
  );
};

export default MotionWrapper;
