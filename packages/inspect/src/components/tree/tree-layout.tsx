import React, { FC, PropsWithChildren, useLayoutEffect, useRef, useState } from 'react';
import { styled as _styled } from '@stitches/react';

// TODO: TS nightly issue?
const styled: any = _styled;

type TreeIndentProps = PropsWithChildren<{ indent?: number }>;

export const TreeWrapper = styled('div', {
  flexGrow: 1,
  padding: '20px',
  position: 'relative',
  minWidth: '100%',
  width: 'fit-content',
});

export const TreeWrapperWithLegend = styled(TreeWrapper, {
  minHeight: 'calc(100% - 130px)',
});

export const TreeTip = styled('div', {
  position: 'relative',
  top: '10px',
});

export const TreeToggle = styled('div', {
  position: 'relative',
  zIndex: 1,
});

export const TreeLegend = styled('div', {
  position: 'absolute',
  left: 0,
  width: '100%',
  top: '100%',
  color: 'var(--LiveInspect-colorTextSemi)',
  fontSize: '0.9em',
  background: '#000',
  zIndex: 10,

  '& > div': {
    position: 'sticky',
    left: 0,
    width: 'fit-content',
    padding: '20px',
  },
});

export const TreeLegendColumns = styled('div', {
  display: 'flex',
});

export const TreeLegendGroup = styled('div', {
});

export const TreeLegendItem = styled('div', {
  margin: '2px 0',
  padding: '0 10px',
  display: 'flex',
  alignItems: 'center',

  '& > div': {
    width: '16px',
    height: '16px',
    margin: '2px 0 0',
    padding: 0,
  },
  '& > span': {
    marginLeft: '10px',
    whiteSpace: 'nowrap',
  },
});

export const TreeLine = styled('div', {
  marginLeft: '-1px',
  borderLeft: '2px dotted var(--LiveInspect-borderVisible)',
});

export const TreeIndent: FC<TreeIndentProps> = ({ indent, children }: TreeIndentProps) => (
  <div style={{
    marginLeft: indent ? `${indent * 20}px` : 0,
  }}>
    {children}
  </div>
);

export const TreeRow: FC<TreeIndentProps> = ({ indent, children }: TreeIndentProps) => (
  <TreeRowInner css={{
    paddingLeft: indent ? `${indent * 20}px` : 0,
  }}>
    {children}
  </TreeRowInner>
);

export const TreeRowOmitted: FC<TreeIndentProps> = ({ indent, children }: TreeIndentProps) => (
  <TreeRowOmittedChunk>
    {children ? <TreeRowAvoidOverlap indent={(indent || 0) * 20}>{children}</TreeRowAvoidOverlap> : null}
  </TreeRowOmittedChunk>
);

export const TreeRowOmittedChunk = styled('div', {
  display: 'flex',
  pointerEvents: 'none',
  height: 20,
  paddingBottom: 20,
  '& + &': {
    marginTop: -20,
  },
});

const TreeRowInner = styled('div', {
  display: 'flex',
  height: '20px',
});

const TreeRowOmittedInner = styled('div', {
  display: 'flex',
  height: 17,
});

type TreeRowAvoidOverlapProps = {
  indent: number,
};

export const TreeRowAvoidOverlap: FC<TreeRowAvoidOverlapProps> = ({ indent, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const {current: el} = ref;
    if (!el) return;
    
    const parent = el.parentElement;
    let sib = parent;
    while (sib = sib.previousElementSibling) {
      if (sib.children.length) break;
    }

    const previous = sib?.children[0];
    if (!previous) return;

    const parentRect = parent.getBoundingClientRect();
    const selfRect = el.getBoundingClientRect();
    const previousRect = previous.getBoundingClientRect();
    
    let maxIndent = indent;
    if (selfRect.top === previousRect.top) {
      maxIndent = Math.max(indent, Math.round(previousRect.right - parentRect.left));
    }    
    el.style.marginLeft = `${maxIndent}px`;
  });
  
  return <TreeRowOmittedInner ref={ref} style={{marginLeft: indent}}>{children}</TreeRowOmittedInner>;
};
