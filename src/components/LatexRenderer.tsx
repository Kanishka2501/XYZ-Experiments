import React from 'react';
import { MathRenderer, MathRendererProps } from './MathRenderer';

export const LatexRenderer: React.FC<MathRendererProps> = (props) => {
  return <MathRenderer {...props} />;
};

export default LatexRenderer;
