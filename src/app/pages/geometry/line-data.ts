import { seq } from '@use-gpu/core';

const randomColor = () => [Math.random(), Math.random(), Math.random(), 1];

const circleX = (a: number, r: number) => Math.cos(a * Math.PI * 2) * r;
const circleY = (a: number, r: number) => Math.sin(a * Math.PI * 2) * r;

const N = 32;

export const lineData = seq(9).map((i) => ({
  // path: [[x, y, z], ...]
  path: (
    (i < 5) ? seq(10).map(j => [i / 5 - 1, j / 11 - 1, 0]) :
    seq(N).map(j => [(.25 + (i%2)*.5 + circleX(j/N, .15)), ((i - 5) / 5 - 1 + circleY(j/N, .15)), 0])
  ),
  // color: [r, g, b, a]
  color: randomColor(),
  width: Math.random() * 30 + 5,
  loop: i >= 5,
}));

export const zigzagData = [{
  path: seq(24).map(i => [i / 14 - 1 - .2, -.1, ((i % 2) - .5) * .1]),
  color: randomColor(),
  width: 10,
}];

export const arrowData = seq(9).map((i) => ({
  path: (
    (i < 5) ? seq(10).map(j => [i / 5 - 1, j / 11, 0]) :
    seq(N).map(j => [.25 + (i%2)*.5 + circleX(j/N, .15), (i - 5) / 5 + circleY(j/N, .15), 0])
  ),
  color: randomColor(),
  width: Math.random() * (i >= 5 ? 3 : 30) + 5,
  loop: i >= 5,
  start: !(i % 2),
  end: !(i % 3) || i === 7,
}));
