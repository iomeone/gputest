import React, { CSSProperties, FC, useCallback, useLayoutEffect, useRef, useState } from 'react';

export type ResizerProps = {
  side: 'left' | 'right' | 'top' | 'bottom',
  min?: number,
  max?: number,
  value: number,
  onChange: (value: number) => void,
};

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

const OUTER_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 100,
};

const INNER_STYLE: CSSProperties = {
  position: 'absolute',
  pointerEvents: 'auto',
};

const POSITION_STYLE: Record<string, CSSProperties> = {
  left: {
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    marginLeft: -3,
    cursor: 'col-resize',
  },
  right: {
    right: 0,
    top: 0,
    bottom: 0,
    width: 6,
    marginLeft: 3,
    cursor: 'col-resize',
  },
  top: {
    left: 0,
    top: 0,
    right: 0,
    height: 6,
    marginTop: -3,
    cursor: 'row-resize',
  },
  bottom: {
    left: 0,
    bottom: 0,
    right: 0,
    height: 6,
    marginTop: 3,
    cursor: 'row-resize',
  },
};

export const Resizer: FC<ResizerProps> = (props: ResizerProps) => {
  const {
    side,
    min = 5,
    max = 100,
    value,
    onChange,
  } = props;
  
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  
  const [dragging, setDragging] = useState<boolean>(false);
  const [toValue, setToValue] = useState<any>(() => (e: any) => 0);

  const onPointerDown = useCallback((e: any) => {
    const {current: outer} = outerRef;
    if (!outer) return;

    e.target.setPointerCapture(e.pointerId);
    
    const {clientX, clientY} = e;
    const {left, right, top, bottom} = e.target.getBoundingClientRect();
    const {left: ll, right: rr, top: tt, bottom: bb} = outer.getBoundingClientRect();

    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;
    
    if (side === 'left') {
      const offset = clientX - cx;
      setToValue(() => (e: any) => clamp(((e.clientX - offset) - rr) / (ll - rr) * value, min, max));
    }
    if (side === 'right') {
      const offset = clientX - cx;
      setToValue(() => (e: any) => clamp(((e.clientX - offset) - ll) / (rr - ll) * value, min, max));
    }
    if (side === 'top') {
      const offset = clientY - cy;
      setToValue(() => (e: any) => clamp(((e.clientY - offset) - bb) / (tt - bb) * value, min, max));
    }
    if (side === 'bottom') {
      const offset = clientY - cy;
      setToValue(() => (e: any) => clamp(((e.clientY - offset) - tt) / (bb - tt) * value, min, max));
    }

    setDragging(true);
  }, [value, min, max]);
  
  const onPointerUp = useCallback((e: any) => {
    setDragging(false);
  }, []);

  const onPointerMove = useCallback((e: any) => {
    onChange(toValue(e));
  }, [toValue, onChange]);
  
  const handlers = {
    onPointerDown,
    onPointerUp,
    onPointerMove: dragging ? onPointerMove : undefined,
  };

  return (
    <div
      ref={outerRef}
      style={OUTER_STYLE}
    >
      <div
        ref={innerRef}
        style={{...INNER_STYLE, ...POSITION_STYLE[side]}}
        {...handlers}
      >
      </div>
    </div>
  );
};
