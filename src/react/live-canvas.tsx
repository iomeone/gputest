import React, { useLayoutEffect, useRef } from 'react';

import { render as renderLive } from '../live';
import { LiveElement } from '../live/types';

export type LiveCanvasProps = {
  style?: Record<string, any>,
  render: (canvas: HTMLCanvasElement) => LiveElement<any>,
};

export const LiveCanvas: React.FC<LiveCanvasProps> = ({style, render}) => {
  const ref = useRef<HTMLCanvasElement>();

  useLayoutEffect(() => {
    if (ref.current) renderLive(render(ref.current));
  }, [render]);

  return <canvas ref={ref} style={style} />;
};
