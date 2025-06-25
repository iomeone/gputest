export const DOM_EVENT_PROPS = [
  // Event
  'preventDefault',
  'stopPropagation',
  'target',
  'type',

  // KeyboardEvent
  'altKey',
  //'charCode',
  'code',
  'ctrlKey',
  'key',
  //'keyCode',
  'locale',
  'metaKey',
  'location',
  'repeat',
  'shiftKey',
  'which',

  // PointerEvent
  'height',
  'isPrimary',
  'pointerId',
  'pointerType',
  'pressure',
  'tangentialPressure',
  'tiltX',
  'tiltY',
  'twist',
  'width',

  // MouseEvent
  'altKey',
  'ctrlKey',
  'clientX',
  'clientY',
  'metaKey',
  'pageX',
  'pageY',
  'relatedTarget',
  'screenX',
  'screenY',
  'shiftKey',

  // UIEvent
  'detail',
  'view',
];

export type DOMEvent = CanvasEvent<HTMLCanvasElement>;
export type UIEvent = DOMEvent & Record<'detail' | 'view', any>;

export type KeyboardEvent = UIEvent & Record<
  | 'altKey'
  //| 'charCode'
  | 'code'
  | 'ctrlKey'
  | 'key'
  //| 'keyCode'
  | 'locale'
  | 'metaKey'
  | 'location'
  | 'repeat'
  | 'shiftKey'
  | 'which',
any>;

export type PointerEvent = UIEvent & {
  x: number,
  y: number,
  moveX: number,
  moveY: number,
  button: ButtonType,
  buttons: Record<ButtonType, boolean>,
} & Record<
  | 'height'
  | 'isPrimary'
  | 'pointerId'
  | 'pointerType'
  | 'pressure'
  | 'tangentialPressure'
  | 'tiltX'
  | 'tiltY'
  | 'twist'
  | 'width'

  | 'altKey'
  | 'ctrlKey'
  | 'clientX'
  | 'clientY'
  | 'metaKey'
  | 'pageX'
  | 'pageY'
  | 'relatedTarget'
  | 'screenX'
  | 'screenY'
  | 'shiftKey',
any>;

export type WheelEvent = UIEvent & {
  x: number,
  y: number,
  moveX: number,
  moveY: number,
  spinX: number,
  spinY: number,
} & Record<
  | 'altKey'
  | 'ctrlKey'
  | 'clientX'
  | 'clientY'
  | 'metaKey'
  | 'pageX'
  | 'pageY'
  | 'relatedTarget'
  | 'screenX'
  | 'screenY'
  | 'shiftKey',
any>;
