import type { LiveFiber } from '@use-gpu/live';

import React, { ReactNode, useState } from 'react';
import { InspectObject } from '@use-gpu/inspect';
import { saveAs } from 'file-saver';

import { styled as _styled } from '@stitches/react';

// TODO: TS nightly issue?
const styled: any = _styled;

export const Button = styled('button', {
  border: 0,
  padding: '10px 15px',
  background: 'var(--LiveInspect-backgroundInactive)',
  color: 'var(--LiveInspect-colorText)',
  '&:focus': {
    position: 'relative',
    zIndex: 1,
    outline: 'none',
    boxShadow: 'inset 0 0 2px 2px rgba(30, 90, 120, 0.3)',
  },
  '&:active': {
    color: 'var(--LiveInspect-colorTextMuted)',
  },
  '&:hover': {
    background: 'var(--LiveInspect-backgroundActive)',
    color: 'var(--LiveInspect-colorTextHover)',
  },
});

type CanvasProps = {
  fiber: LiveFiber<any>,
};

export const renderCanvas = (props: any) => <Canvas {...props} />;

export const Canvas: React.FC<CanvasProps> = ({fiber}) => {

  const canvas = fiber.__inspect?.canvas;
  if (!canvas) return null;

  const save = () => {
    const {args, host} = fiber;
    if (args?.[0]) args[0].backgroundColor = [...(args[0].backgroundColor ?? [0, 0, 0, 1])];
    if (host) {
      host.schedule(fiber);
      host.flush();
    }

    setTimeout(() => {
      const png = canvas.element.toBlob((blob: Blob) => {
        saveAs(blob, 'canvas.png');
      });
    }, 100);
  };

  return (<>
    <Button onClick={save}>Save PNG</Button>
  </>);
}
