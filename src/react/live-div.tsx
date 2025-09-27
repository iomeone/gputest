import React, { useLayoutEffect, useRef } from 'react';

import { render as renderLive } from '@use-gpu/live';
import { LiveElement } from '@use-gpu/live/types';

export type LiveDivProps = {
  style?: Record<string, any>,
  render: (div: HTMLDivElement) => LiveElement<any>,
};

export const LiveDiv: React.FC<LiveDivProps> = ({style, render}) => {
  const ref = useRef<HTMLDivElement>();

  useLayoutEffect(() => {
    if (ref.current) renderLive(render(ref.current));
  }, [render]);

  return <div ref={ref} style={style} />;
};
