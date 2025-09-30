import type { XY } from './types';
import {
  cubicBezier,
  cubicBezierInverse,
  cubicBezierInverse01NR,
  cubicBezierInverse01,
  bezierEase,
  makeArcLengthMap,
  queryArcLengthMap,
  sampleToCubicBezier,
  catmullRomWeightedDual,
} from './ease';
import { vec2 } from 'gl-matrix';

import { Benchmark } from 'benchmark';

describe('ease', () => {

  it('beziers', () => {

    expect(cubicBezier(0, 0.4, 0.4, 0.4, 0.4)).toEqual(0.4);
    expect(cubicBezier(1, 0.4, 0.4, 0.4, 0.4)).toEqual(0.4);

    expect(cubicBezier(0.5, 1, 1, 2, 2)).toEqual(1.5);
    expect(cubicBezier(0.25, 0, 0, 1, 1)).toEqual(0.15625);
    expect(cubicBezier(0.32, 0, .1, .6, 1)).toBeCloseTo(0.202496, 8);

    expect(cubicBezierInverse01(0.15625, 0, 1)).toBeCloseTo(0.25, 8);
    expect(cubicBezierInverse01(0.202496, .1, .6)).toBeCloseTo(0.32, 8);
    expect(cubicBezierInverse01(0.4, 1/3, 2/3)).toBeCloseTo(0.4, 8);

    expect(cubicBezierInverse01NR(0.15625, 0, 1)).toBeCloseTo(0.25, 8);
    expect(cubicBezierInverse01NR(0.202496, .1, .6)).toBeCloseTo(0.32, 8);
    expect(cubicBezierInverse01NR(0.4, 1/3, 2/3)).toBeCloseTo(0.4, 8);

    expect(bezierEase(0, .25, .25, .75, .75)).toEqual(0);
    expect(bezierEase(1, .25, .25, .75, .75)).toEqual(1);
    expect(bezierEase(0.5, .25, .25, .75, .75)).toBeCloseTo(0.5, 8);
    expect(bezierEase(0.333, .25, .25, .75, .75)).toBeCloseTo(0.333, 8);
    expect(bezierEase(1 - 0.333, .25, .25, .75, .75)).toBeCloseTo(1 - 0.333, 8);

    expect(bezierEase(0, .25, 0, .75, 1)).toEqual(0);
    expect(bezierEase(1, .25, 0, .75, 1)).toEqual(1);
    expect(bezierEase(0.5, .25, 0, .75, 1)).toBeCloseTo(0.5, 8);
    expect(bezierEase(0.333, .25, 0, .75, 1)).toBeCloseTo(0.28182818072289406, 8);
    expect(bezierEase(1 - 0.333, .25, 0, .75, 1)).toBeCloseTo(1 - 0.28182818072289406, 8);

    expect(bezierEase(0, 0, .25, 1, .75)).toEqual(0);
    expect(bezierEase(1, 0, .25, 1, .75)).toEqual(1);
    expect(bezierEase(0.5, 0, .25, 1, .75)).toBeCloseTo(0.5, 8);
    expect(bezierEase(0.333, 0, .25, 1, .75)).toBeCloseTo(0.37329669401328697, 8);
    expect(bezierEase(1 - 0.333, 0, .25, 1, .75)).toBeCloseTo(1 - 0.37329669401328697, 8);

  });

  it('distance maps', () => {

    const sqr = (x: number) => x * x;
    const distance = ([x1, y1]: XY, [x2, y2]: XY) => Math.sqrt(sqr(x1 - x2) + sqr(y1 - y2));

    const point = (t: number) => [
      cubicBezier(t, 0, 1, -1, 1),
      cubicBezier(t, 0, 0, 0.5, 1),
    ] as XY;

    const measure = (t1: number, t2: number) => {
      return distance(point(t1), point(t2))
    };

    const map = makeArcLengthMap(measure, 0.003);
    expect(map.length).toBeCloseTo(1.9224753381814543, 5);

  });

  it('queries distance map', () => {

    {
      const map = {map: [-2, -0.25, 0, 0, 2, 0.25, 4, 0.5, 6, 0.75, 8, 1, 10, 1.25], count: 5, length: 8, limit: 10};
      expect(queryArcLengthMap(map, 3)).toEqual(0.375);
    }

    {
      const map = {map: [-2, -0.25, 0, 0, 2, 0.25, 4, 0.5, 5, 0.625, 6, 0.85, 8, 1, 10, 1.25], count: 6, length: 8, limit: 10};
      expect(queryArcLengthMap(map, 3)).toEqual(0.375);
      expect(queryArcLengthMap(map, 7)).toEqual(0.9437500000000001);
    }

  });

  it('queries distance map around double knot', () => {

    const sqr = (x: number) => x * x;
    const distance = ([x1, y1]: XY, [x2, y2]: XY) => Math.sqrt(sqr(x1 - x2) + sqr(y1 - y2));

    const point = (t: number) => [
      cubicBezier(t, 0, 0, 0.5, -1),
      cubicBezier(t, 0, 0, 1, 1),
    ] as XY;

    const measure = (t1: number, t2: number) => {
      return distance(point(t1), point(t2))
    };

    const map = makeArcLengthMap(measure, 0.003);
    expect(map.length).toBeCloseTo(1.7785519999027182, 5);
    expect(queryArcLengthMap(map, 0.1)).toBeCloseTo(0.19208538216220233, 5);

  });

  it('converts centripetal catmull rom to bezier', () => {
    const p0 = [1, 2];
    const p1 = [2, 1];
    const p2 = [4, 3];
    const p3 = [4, 0];

    const d1 = vec2.clone(p1);
    const d2 = vec2.clone(p2);
    const d3 = vec2.clone(p3);
    vec2.sub(d1, p1, p0);
    vec2.sub(d2, p2, p1);
    vec2.sub(d3, p3, p2);

    const l1 = vec2.length(d1);
    const l2 = vec2.length(d2);
    const l3 = vec2.length(d3);

    const sampleX = (t: number) => catmullRomWeightedDual(t, p0[0], p1[0], p2[0], p3[0], l1, l2, l3);
    const sampleY = (t: number) => catmullRomWeightedDual(t, p0[1], p1[1], p2[1], p3[1], l1, l2, l3);

    const [x0, x1, x2, x3] = sampleToCubicBezier(sampleX);
    const [y0, y1, y2, y3] = sampleToCubicBezier(sampleY);

    for (let i = 0; i <= 16; ++i) {
      const t = i / 16;
      const cm = [sampleX(t)[0], sampleY(t)[0]];
      const bez = [cubicBezier(t, x0, x1, x2, x3), cubicBezier(t, y0, y1, y2, y3)];

      expect(cm[0]).toBeCloseTo(bez[0], 8);
      expect(cm[1]).toBeCloseTo(bez[1], 8);
    }
  });

});
