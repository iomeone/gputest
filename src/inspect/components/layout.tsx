import React, { FC, PropsWithChildren } from 'react';
import { styled as _styled } from '@stitches/react';

// TODO: TS nightly issue?
const styled: any = _styled;

type TreeIndentProps = PropsWithChildren<{ indent?: number }>;

export const Button = styled('button', {
  border: 0,
  padding: '10px 15px',
  background: 'var(--LiveInspect-backgroundInactive)',
  color: 'var(--LiveInspect-colorText)',
  '&:focus': {
    position: 'relative',
    zIndex: 1,
    outline: 'none',
    boxShadow: 'inset 0 0 2px 2px rgba(30, 90, 120, 0.3)',
  },
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
  '&:focus': {
    position: 'relative',
    zIndex: 1,
    outline: 'none',
    boxShadow: 'inset 0 0 2px 2px rgba(30, 90, 120, 0.3)',
  },
  '&:hover': {
    background: 'var(--LiveInspect-backgroundHover)',
    color: 'var(--LiveInspect-colorTextHover)',
  },
  '&:active': {
    background: 'var(--LiveInspect-backgroundActive)',
  },
  '&.active': {
    background: 'var(--LiveInspect-backgroundOn)',
    color: 'var(--LiveInspect-colorTextOn)',
  },
  '&.active:active': {
    background: 'var(--LiveInspect-backgroundOnActive)',
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

export const OptionsContainer = styled('div', {
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  width: '100%',
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
  zIndex: 100,
});

export const TreeControls = styled('div', {
  pointerEvents: 'auto',
  background: 'rgba(50, 50, 50, 0.75)',
  zIndex: 10,

  display: 'flex',
});

export const TreeView = styled('div', {
  overflow: 'auto',
  flexGrow: 1,
});

export const Muted = styled('span', {
  color: 'var(--LiveInspect-colorTextMuted)',
});

export const Spacer = styled('div', {
  width: '20px',
  height: '20px',
});

export const Grow = styled('div', {
  flexGrow: 1,
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

export const PanelAbsolute = styled(Panel, {
  position: 'absolute',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
});

export const Inset = styled('div', {
  padding: '20px',
});

export const InsetLeftRightBottom = styled('div', {
  padding: '0 20px 20px 20px',
});

export const InsetColumnFull = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
});

export const Label = styled('div', {
  fontWeight: 'bold',
  paddingRight: '10px',
  flexShrink: '0',
  display: 'flex',
});

export const TreeWrapper = styled('div', {
  flexGrow: 1,
  padding: '20px',
  position: 'relative',
  minWidth: '100%',
  width: 'fit-content',
});

export const TreeWrapperWithLegend = styled(TreeWrapper, {
  minHeight: 'calc(100% - 110px)',
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
    display: 'flex',
    width: 'fit-content',
    padding: '20px',
  },
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

export const TreeRowOmittedChunk = styled('div', {
  height: 20,
  paddingBottom: 20,
  '& + &': {
    marginTop: -20,
  },
});

export const TreeRow: FC<TreeIndentProps> = ({ indent, children }: TreeIndentProps) => (
  <TreeRowInner css={{
    paddingLeft: indent ? `${indent * 20}px` : 0,
  }}>
    {children}
  </TreeRowInner>
);

export const TreeRowOmitted: FC<TreeIndentProps> = ({ indent, children }: TreeIndentProps) => (
  <TreeRowOmittedChunk css={{
    paddingLeft: indent ? `${indent * 20}px` : 0,
  }}>
    {children}
  </TreeRowOmittedChunk>
);

export const TreeIndent: FC<TreeIndentProps> = ({ indent, children }: TreeIndentProps) => (
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
