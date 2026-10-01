import React from 'react';
import { MathRenderer, MathRendererProps } from './MathRenderer';

export const MathView: React.FC<MathRendererProps> = (props) => {
  return <MathRenderer {...props} />;
};

export default MathView;
