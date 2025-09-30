// Common enums
export type Domain = 'linear' | 'log';
export type Join = 'miter' | 'round' | 'bevel';
export type Placement = 'center' | 'left' | 'top' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
export type PointShape = 'circle' | 'diamond' | 'square' | 'up' | 'down' | 'left' | 'right';

export type Parser<A, B> = (t: A) => B;
