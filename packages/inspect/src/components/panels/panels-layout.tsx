import { styled as _styled } from '@stitches/react';

// TODO: TS nightly issue?
const styled: any = _styled;

export const SidebarPanel = styled('div', {
  overflow: 'auto',
  flexGrow: 1,
});

export const ToolbarRow = styled('div', {
  background: 'var(--LiveInspect-backgroundEmpty)',
  pointerEvents: 'auto',
  zIndex: 10,

  display: 'flex',
});

export const ToolbarPaddedRow = styled('div', {
  background: 'var(--LiveInspect-backgroundEmpty)',
  padding: '6px 8px',
  position: 'relative',
  width: '100%',

  display: 'flex',
});

export const StyledTabList = styled('div', {
  height: '40px',
  borderBottom: '2px solid var(--LiveInspect-backgroundInactive)',
  marginBottom: '10px',
});

export const StyledTab = styled('button', {
  background: 'none',
  font: 'inherit',
  color: 'inherit',
  border: '0',
  padding: '0px 20px',
  lineHeight: '40px',
  height: '40px',
  marginBottom: '-2px',
  borderBottom: '2px solid transparent',
  '&:hover': {
    borderBottom: '3px solid var(--LiveInspect-backgroundHover)',
  },
  '&.active': {
    fontWeight: 'bold',
    color: 'var(--LiveInspect-colorTextActive)',
    borderBottom: '3px solid var(--LiveInspect-backgroundActive)',
  },
});

export const ToolbarLabel = styled('div', {
  alignSelf: 'center',
  padding: '5px 0',
});
