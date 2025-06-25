export type ButtonType = 'left' | 'middle' | 'right';
export type ModifierType = 'shift' | 'alt' | 'accel';

export type ActionBinding = {
  wheel?: boolean,
  button?: ButtonType,
  modifiers?: ModifierType[],
};

export type ActionMap = Record<string, ActionBinding[] | null>;

export type MouseState = {
  buttons: Record<ButtonType, boolean>,
  button: ButtonType | null,
  x: number,
  y: number,
  moveX: number,
  moveY: number,
};

export type WheelState = {
  x: number,
  y: number,
  moveX: number,
  moveY: number,
  spinX: number,
  spinY: number,
};

export type KeyboardState = Record<string, boolean>;

export type PointerCaptureAPI = {
  hasCapture: () => number | null,
  beginCapture: (id: number) => void,
  endCapture: () => void,
};

export type PointerLockAPI = {
  beginLock: () => void,
  endLock: () => void,
  hasLock: () => boolean,
};

export type CanvasEvent<T = any> = {
  preventDefault: () => void,
  stopPropagation: () => void,
  target: T,

  detail: number,
  which: number,
};

export type KeyboardEvent<T = any> = CanvasEvent<T> & {
  altKey: boolean,
  code: string,
  ctrlKey: boolean,
  isComposing: boolean,
  key: string,
  locale: string,
  location: number,
  metaKey: boolean,
  repeat: boolean;
  shiftKey: boolean,
};

export type PointerEvent<T = any> = CanvasEvent<T> & MouseState & {
  //coalescedEvents?: PointerEvent[];
  //predictedEvents?: PointerEvent[];

  height: number,
  isPrimary: boolean,
  pointerId: number,
  pointerType: string,
  pressure: number,
  tangentialPressure: number,
  tiltX: number,
  tiltY: number,
  twist: number,
  width: number,

  clientX: number;
  clientY: number;
  relatedTarget: EventTarget | null;
  screenX: number;
  screenY: number;

  altKey: boolean,
  ctrlKey: boolean,
  metaKey: boolean,
  shiftKey: boolean,
};

export type WheelEvent<T = any> = CanvasEvent<T> & WheelState & {
  clientX: number;
  clientY: number;
  relatedTarget: EventTarget | null;
  screenX: number;
  screenY: number;

  altKey: boolean,
  ctrlKey: boolean,
  metaKey: boolean,
  shiftKey: boolean,
};
