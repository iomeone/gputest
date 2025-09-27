import React, { PropsWithChildren } from 'react';
import { styled as _styled } from '@stitches/react';

// TODO: TS nightly issue?
const styled: any = _styled;

type TreeIndentProps = { indent?: number };

export const Button = styled('button', {
  border: 0,
  padding: '10px 20px',
  background: 'var(--LiveInspect-backgroundInactive)',
  color: 'var(--LiveInspect-colorText)',
  '&:active': {
    color: 'var(--LiveInspect-colorTextMuted)',
  },
  '&:hover': {
    background: 'var(--LiveInspect-backgroundActive)',
    color: 'var(--LiveInspect-colorTextHover)',
  },
});

export const SmallButton = styled('button', {
  border: 0,
  padding: '5px 10px',
  background: 'var(--LiveInspect-backgroundInactive)',
  color: 'var(--LiveInspect-colorText)',
  '&:hover': {
    background: 'var(--LiveInspect-backgroundActive)',
    color: 'var(--LiveInspect-colorTextHover)',
  },
  '&:active': {
    color: 'var(--LiveInspect-colorTextMuted)',
  },
  '&.active': {
    background: 'var(--LiveInspect-backgroundOn)',
    color: 'var(--LiveInspect-colorTextOn)',
  },
});

export const InspectContainer = styled('div', {
  pointerEvents: 'none',
  color: 'var(--LiveInspect-colorText)',
  cursor: 'default',
  position: 'relative',
  height: '100%',
  userSelect: 'none',
});

export const Selectable = styled('div', {
  userSelect: 'text',
});

export const InspectContainerCollapsed = styled(InspectContainer, {
  width: '34%',
  position: 'relative',
});

export const InspectToggle = styled('div', {
  position: 'absolute',
  right: 0,
  top: 0,
  pointerEvents: 'auto',
});

export const TreeControls = styled('div', {
  position: 'absolute',
  padding: '10px 20px',
  right: '6px',
  top: 0,
  width: 160,
  pointerEvents: 'auto',
  background: 'rgba(0, 0, 0, 0.75)',
  zIndex: 10,

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'end',
});

export const Muted = styled('span', {
  color: 'var(--LiveInspect-colorTextMuted)',
});

export const Spacer = styled('div', {
  width: '20px',
  height: '20px',
});

export const SplitRow = styled('div', {
  display: 'flex',
  height: '100%',
});

export const SplitColumn = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const SplitRowFull = styled(SplitRow, {
  width: '100%',
});

export const SplitColumnFull = styled(SplitColumn, {
  height: '100%',
  flexGrow: 1,
});

export const RowPanel = styled('div', {
  position: 'relative',
  '&:not(:last-child)': {
    borderRight: '1px solid var(--LiveInspect-borderThin)',
  }
});

export const ColumnPanel = styled('div', {
  '&:not(:last-child)': {
    borderBottom: '1px solid var(--LiveInspect-borderThin)',
  }
});

export const Panel = styled('div', {
  pointerEvents: 'auto',
  background: 'var(--LiveInspect-shim)',
  maxHeight: '100%',
});

export const PanelScrollable = styled('div', {
  pointerEvents: 'auto',
  background: 'var(--LiveInspect-shim)',
  maxHeight: '100%',
  overflow: 'auto',
});

export const PanelFull = styled(Panel, {
  height: '100%',
  overflow: 'auto',
});

export const Inset = styled('div', {
  padding: '20px',
});

export const InsetColumnFull = styled('div', {
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100%',
});

export const Label = styled('div', {
  fontWeight: 'bold',
  paddingRight: '10px',
  flexShrink: '0',
  display: 'flex',
});

export const TreeWrapper = styled('div', {
  flexGrow: 1,
});

export const TreeToggle = styled('div', {
  position: 'relative',
  zIndex: 1,
});

export const TreeLegend = styled('div', {
  position: 'sticky',
  left: 0,
  color: 'var(--LiveInspect-colorTextSemi)',
  paddingTop: '30px',
  display: 'flex',
  flexWrap: 'wrap',
  fontSize: '0.9em',
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
  },
});

export const TreeLine = styled('div', {
  marginLeft: '-1px',
  borderLeft: '2px dotted var(--LiveInspect-borderThin)',
});

export const TreeRowOmittedChunk = styled('div', {
  height: 20,
  paddingBottom: 20,
  '& + &': {
    marginTop: -20,
  },
});

export const TreeRow: React.FC<TreeIndentProps> = ({ indent, children }) => (
  <TreeRowInner css={{
    paddingLeft: indent ? `${indent * 20}px` : 0,
  }}>
    {children}
  </TreeRowInner>
);

export const TreeRowOmitted: React.FC<TreeIndentProps> = ({ indent, children }) => (
  <TreeRowOmittedChunk />
);

export const TreeIndent: React.FC<TreeIndentProps> = ({ indent, children }) => (
  <div style={{
    marginLeft: indent ? `${indent * 20}px` : 0,
  }}>
    {children}
  </div>
);

const TreeRowInner = styled('div', {
  display: 'flex',
  height: '20px',
});

export const DOMMock = styled('div', {
  position: 'absolute',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  background: 'rgba(255, 255, 255, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});
