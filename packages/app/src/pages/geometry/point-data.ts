import { seq } from '@use-gpu/core';

const randomColor = () => [Math.random(), Math.random(), Math.random(), 1];

const circleX = (a: number, r: number) => Math.cos(a * Math.PI * 2) * r;
const circleY = (a: number, r: number) => Math.sin(a * Math.PI * 2) * r;

const N = 32;

export const pointData = seq(32).map((i) => ({
  // path: [[x, y, z], ...]
  position: [circleX(i / 32, 1), circleY(i / 32, 1), 0],
  // color: [r, g, b, a]
  color: randomColor(),
  size: Math.random() * 30 + 5,
  label: `${['hello', 'world'][i % 2]} ${i + 1}`,
}));

export const labelData = pointData.map(p => p.label);

