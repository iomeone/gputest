import React, { ReactNode } from 'react';

type Option<T> = {
  value: T,
  label: string | ReactNode,
};

type SelectProps<T> = {
  options: Option<T>[],
  value: T,
  onChange: (t: T) => void,
};

export const Select = <T,>(props: SelectProps<T>) => {
  const {options, value, onChange} = props;
  return (
    <select value={options.findIndex(o => o.value === value)} onChange={(e) => onChange(options[e.target.value as any].value)}>
      {options.map((option, i) => <option key={i.toString()} value={i.toString()}>{option.label}</option>)}
    </select>
  );
};
