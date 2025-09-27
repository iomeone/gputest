import type { Point } from './types';
import { cubicBezier, cubicBezierDt, cubicBezierInverse, makeDistanceMap, queryDistanceMap } from './ease';

describe('ease', () => {
  
  it('beziers', () => {
    
    expect(cubicBezier(0.5, 1, 1, 2, 2)).toEqual(1.5);
    expect(cubicBezier(0.25, 0, 0, 1, 1)).toEqual(0.15625);
    expect(cubicBezier(0.32, 0, .1, .6, 1)).toEqual(0.202496);

    expect(cubicBezierInverse(0.15625, 0, 0, 1, 1)).toBeCloseTo(0.25, 8);
    expect(cubicBezierInverse(0.202496, 0, .1, .6, 1)).toBeCloseTo(0.32, 8);
    
  });
  
  it('distance maps', () => {

    const sqr = (x: number) => x * x;
    const distance = ([x1, y1]: Point, [x2, y2]: Point) => Math.sqrt(sqr(x1 - x2) + sqr(y1 - y2));

    const point = (t: number) => [
      cubicBezier(t, 0, 3, -1, 1),
      cubicBezier(t, 0, 0, 1, 1),
    ] as Point;

    const measure = (t1: number, t2: number) => {
      return distance(point(t1), point(t2))
    };
    
    const map = makeDistanceMap(measure, 0.003);
    expect(map.length).toBeCloseTo(2.88129414374905, 3);
    
  });
  
  it('queries distance map', () => {

    {
      const map = {map: [-2, -0.25, 0, 0, 2, 0.25, 4, 0.5, 6, 0.75, 8, 1, 10, 1.25], count: 5, length: 8} as any;
      expect(queryDistanceMap(map, 3)).toEqual(0.375);
    }

    {
      const map = {map: [-2, -0.25, 0, 0, 2, 0.25, 4, 0.5, 5, 0.625, 6, 0.85, 8, 1, 10, 1.25], count: 6, length: 8} as any;
      expect(queryDistanceMap(map, 3)).toEqual(0.375);
      expect(queryDistanceMap(map, 7)).toEqual(0.9437500000000001);
    }
    
  });
  
});