import React from 'react';
import { styled } from '@stitches/react';

type TreeIndentProps = { indent?: number };

export const Button = styled('button', {
  border: 0,
  padding: '10px 20px',
  background: 'var(--backgroundInactive)',
  color: 'var(--colorText)',
  '&:hover': {
    background: 'var(--backgroundActive)',
    color: 'var(--colorTextHighlight)',
  },
});

export const InspectContainer = styled('div', {
  pointerEvents: 'none',
  color: 'var(--colorText)',
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
});

export const Muted = styled('span', {
  color: 'var(--colorTextMuted)',
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
    borderRight: '1px solid var(--borderThin)',
  }
});

export const ColumnPanel = styled('div', {
  '&:not(:last-child)': {
    borderBottom: '1px solid var(--borderThin)',
  }
});

export const Panel = styled('div', {
  pointerEvents: 'auto',
  background: 'var(--shim)',
  maxHeight: '100%',
});

export const PanelScrollable = styled('div', {
  pointerEvents: 'auto',
  background: 'var(--shim)',
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
  color: 'var(--colorTextSemi)',
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
  borderLeft: '2px dotted var(--borderThin)',
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
