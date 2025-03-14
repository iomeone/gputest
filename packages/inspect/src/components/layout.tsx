import React, { FC, PropsWithChildren } from 'react';
import { styled as _styled } from '@stitches/react';

// TODO: TS nightly issue?
const styled: any = _styled;

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
  padding: '5px 8px',
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
  '&.active:hover': {
    background: 'var(--LiveInspect-backgroundOnHover)',
  },
  '&.active:active': {
    background: 'var(--LiveInspect-backgroundOnActive)',
  },
});

export const InlineButton = styled('div', {
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  margin: '0px 4px',
  padding: '2px 8px',
  '&.icon-left': { paddingLeft: 0 },
  '&.icon-right': { paddingRight: 0 },
  '&:hover': {
    background: "#444",
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

export const Selectable = styled('span', {
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

export const Muted = styled('span', {
  color: 'var(--LiveInspect-colorTextMuted)',
});

export const Row = styled('div', {
  display: 'flex',
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

export const DOMMock = styled('div', {
  position: 'absolute',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  background: 'rgba(255, 255, 255, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});
