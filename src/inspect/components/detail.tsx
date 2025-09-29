import React, { useEffect, useRef } from 'react';
import { styled as _styled } from '@stitches/react';

const styled: any = _styled;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

export type DetailProps = {
  value: number,
  onChange: (x: number) => void,
};

export const StyledSlider = styled('div', {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  width: '100%',
  height: 20,
});

const StyledTrack = styled('div', {
  backgroundColor: 'var(--LiveInspect-trackBackground)',
  position: 'relative',
  flexGrow: 1,
  borderRadius: '5px',
  height: 5,
});

const StyledThumb = styled('div', {
  position: 'absolute',
  display: 'block',
  width: 20,
  height: 20,
  backgroundColor: 'var(--LiveInspect-thumbBackground)',
  boxShadow: `0 2px 10px var(--LiveInspect-depthShadow)`,
  borderRadius: 10,
  '&:hover': { backgroundColor: 'var(--LiveInspect-thumbHover)'},
  '&:focus': {
    outline: 'none',
    boxShadow: 'inset 0 0 2px 2px var(--LiveInspect-focusShadow)',
  },
});

const min = 1;
const max = 12;
const step = 1;

export const DetailSlider: React.FC<DetailProps> = (props: DetailProps) => {
  let {value, onChange} = props;
  let clamped = clamp(value, min, max);

  const sliderRef = useRef<HTMLDivElement>();
  const thumbRef = useRef<HTMLDivElement>();
  const draggingRef = useRef<any>(null);
  
  const setDraggingOn = (e: any, value: number) => {
    const {clientX, clientY} = e;
    draggingRef.current = {
      anchor: [clientX, clientY],
      value,
    };
    (e.target as any).setPointerCapture(e.pointerId);
  };
  
  const handlePointerDown = (e: any) => {
    setDraggingOn(e, clamped);
  };

  const handlePointerUp = (e: any) => {
    draggingRef.current = null;
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handlePointerMove = (e: any) => {
    const {current: dragging} = draggingRef;
    const {current: slider} = sliderRef;
    const {current: thumb} = thumbRef;
    if (!dragging || !slider || !thumb) return;
    
    const {width: sliderWidth} = slider.getBoundingClientRect();
    const {width: thumbWidth} = thumb.getBoundingClientRect();
    const delta = sliderWidth - thumbWidth;

    const {clientX} = e;
    const {value: anchorValue, anchor: [x]} = dragging;
    
    const offset = (clientX - x) / delta * (max - min);
    const v = min + clamp(Math.round((anchorValue - min + offset) / step) * step, 0, max - min);
    const inf = v >= max ? 1000 : v;
    if (inf !== value) onChange(inf);
  };
  
  const handleTrack = (e: any) => {
    const {current: slider} = sliderRef;
    const {current: thumb} = thumbRef;
    if (!slider || !thumb) return;
    
    const {left, width: sliderWidth} = slider.getBoundingClientRect();
    const {width: thumbWidth} = thumb.getBoundingClientRect();
    const delta = sliderWidth - thumbWidth;    

    const {clientX} = e;
    const v = clamp((clientX - left) / delta, 0, 1) * (max - min);
    const inf = v >= max ? 1000 : v;
    if (inf !== value) onChange(inf);

    setDraggingOn(e, v);
  };
  
  useEffect(() => {
    const {current: slider} = sliderRef;
    const {current: thumb} = thumbRef;
    if (!slider || !thumb) return;
    
    const {width: sliderWidth} = slider.getBoundingClientRect();
    const {width: thumbWidth} = thumb.getBoundingClientRect();
    const delta = sliderWidth;

    const pos = (clamped - min) / (max - min);
    thumb.style.left = Math.round(pos * 100) + '%';
    thumb.style.marginLeft = `-${Math.round(thumbWidth / 2)}px`;
  }, [clamped]);
  
  return (
    <StyledSlider
      ref={sliderRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <StyledTrack onPointerDown={handleTrack} />
      <StyledThumb
        tabIndex={0}
        ref={thumbRef}
        onPointerDown={handlePointerDown}
      />
    </StyledSlider>
  );
};