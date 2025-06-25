export type MouseButton = 'left' | 'middle' | 'right';
export type KeyboardModifier = 'shift' | 'alt' | 'accel';

export type MouseState = {
  buttons: Record<MouseButton, boolean>,
  button: MouseButton | null,
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

export type EventCallback<T extends CanvasEvent<T> = CanvasEvent<any>> = (event: T) => void;
export type EventBinding<T extends CanvasEvent<T> = CanvasEvent<any>> = {
  id: number,
  callback: EventCallback<T>,
};

export type EventHandler<T extends CanvasEvent<T> = CanvasEvent<any>> = EventCallback<T> | EventBinding<T>;

export type CanvasEvent<T = any> = {
  type: string,
  target: T,
  preventDefault: () => void,
  stopPropagation: () => void,

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
