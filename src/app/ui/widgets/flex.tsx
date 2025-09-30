import React, { PropsWithChildren, ReactNode } from 'react';

type RowProps = PropsWithChildren<{
  gap?: number,
}>;

export const Row = (props: RowProps) => {
  const {gap, children} = props;
  return (
    <div style={{display: 'flex', flexDirection: 'row', gap}}>
      {children}
    </div>
  );
};
