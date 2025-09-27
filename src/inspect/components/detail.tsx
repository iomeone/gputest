import React from 'react';
import { styled as _styled } from '@stitches/react';
import * as SliderPrimitive from '@radix-ui/react-slider';

const styled: any = _styled;

export type DetailProps = {
  value: number,
  onChange: (x: number) => void,
};

export const StyledSlider = styled(SliderPrimitive.Root, {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  width: '100%',

  '&[data-orientation="horizontal"]': {
    height: 20,
  },

  '&[data-orientation="vertical"]': {
    flexDirection: 'column',
    width: 20,
    height: '100%',
  },
});

const StyledTrack = styled(SliderPrimitive.Track, {
  backgroundColor: 'var(--LiveInspect-trackBackground)',
  position: 'relative',
  flexGrow: 1,
  borderRadius: '5px',

  '&[data-orientation="horizontal"]': { height: 5 },
  '&[data-orientation="vertical"]': { width: 5 },
});

const StyledRange = styled(SliderPrimitive.Range, {
  position: 'absolute',
  backgroundColor: 'var(--LiveInspect-trackFill)',
  borderRadius: '9999px',
  height: '100%',
});

const StyledThumb = styled(SliderPrimitive.Thumb, {
  all: 'unset',
  display: 'block',
  width: 20,
  height: 20,
  backgroundColor: 'var(--LiveInspect-thumbBackground)',
  boxShadow: `0 2px 10px var(--LiveInspect-focusShadow)`,
  borderRadius: 10,
  '&:hover': { backgroundColor: 'var(--LiveInspect-thumbHover)'},
  '&:focus': { boxShadow: `0 0 0 5px var(--LiveInspect-focusShadow)` },
});

export const DetailSlider: React.FC<DetailProps> = (props: DetailProps) => {
  
  const {value, onChange} = props;
  
  return (
    <StyledSlider value={[Math.min(12, value)]} onValueChange={(v: [number]) => onChange(v[0] < 12 ? v[0] : 100)} min={1} max={12}>
      <StyledTrack>
        <StyledRange />
      </StyledTrack>
      <StyledThumb />
    </StyledSlider>
  );
};