import React, { ReactNode } from 'react';

type CheckboxProps = {
  label?: string,
  disabled?: boolean,
  value: boolean,
  onChange: (t: boolean) => void,
};

export const Checkbox = (props: CheckboxProps) => {
  const {label, disabled, value, onChange} = props;
  const check = (
    <input
      type="checkbox"
      disabled={disabled}
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
  if (label != null) return <label>{check} {label}</label>;
  return check;
};
