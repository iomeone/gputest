import React, { ReactNode } from 'react';

type SliderProps = {
  value: number,
  min: number,
  max: number,
  step?: number,
  onChange: (t: number) => void,
};

export const Slider = (props: SliderProps) => {
  const {value, min, max, step, onChange} = props;
  return (
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(parseFloat(e.target.value))}
    />
  );
};
