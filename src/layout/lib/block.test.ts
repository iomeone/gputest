import type { Rectangle, Point } from '@use-gpu/core';
import type { Sizing, Margin } from '../types';

describe('', () => { it("", () => {})});

/*

import { getBlockMinMax, getBlockMargin, fitBlock } from './block';
import { makeBoxLayout } from './util';

describe('block layout', () => {
  
  let ID = 0;
  const makeElement = (
    width: number,
    height: number,
    m: number = 0,
  ) => {
    const sizing = [width, height, width, height] as Sizing;
    const margin = [m, m, m, m] as Margin;
    return {
      key: ++ID,
      sizing,
      margin,
      fit: () => ({
        size: [width, height] as Point,
        render: (layout: Rectangle) => ({layout}) as any,
      }),
    };
  };

  it("gets block min/max", () => {
    const els = [
      makeElement(50, 50),
      makeElement(20, 20),
    ];

    {
      const sizingX = getBlockMinMax(els, [null, null], [0, 0, 0, 0], 'x');
      expect(sizingX).toEqual([70, 50, 70, 50]);

      const sizingY = getBlockMinMax(els, [null, null], [0, 0, 0, 0], 'y');
      expect(sizingY).toEqual([50, 70, 50, 70]);
    }

    {
      const sizingX = getBlockMinMax(els, [null, null], [1, 2, 3, 4], 'x');
      expect(sizingX).toEqual([74, 56, 74, 56]);

      const sizingY = getBlockMinMax(els, [null, null], [1, 2, 3, 4], 'y');
      expect(sizingY).toEqual([54, 76, 54, 76]);
    }
  });

  it("gets block min/max with fixed", () => {
    const els = [
      makeElement(50, 50),
      makeElement(20, 20),
    ];

    const sizingX = getBlockMinMax(els, [800, 500], [0, 0, 0, 0], 'x');
    expect(sizingX).toEqual([800, 500, 800, 500]);

    const sizingY = getBlockMinMax(els, [800, 500], [0, 0, 0, 0], 'y');
    expect(sizingY).toEqual([800, 500, 800, 500]);
  });

  it("gets block margin with collapse", () => {
    const els = [
      makeElement(50, 50, 10),
      makeElement(20, 20, 20),
    ];

    {
      const sizingX = getBlockMargin(els, [0, 0, 0, 0], [0, 0, 0, 0], 'x', false);
      expect(sizingX).toEqual([10, 0, 20, 0]);

      const sizingY = getBlockMargin(els, [0, 0, 0, 0], [0, 0, 0, 0], 'y', false);
      expect(sizingY).toEqual([0, 10, 0, 20]);
    }

    {
      const sizingX = getBlockMargin(els, [5, 3, 7, 10], [0, 0, 0, 0], 'x', false);
      expect(sizingX).toEqual([10, 3, 20, 10]);

      const sizingY = getBlockMargin(els, [5, 3, 7, 10], [0, 0, 0, 0], 'y', false);
      expect(sizingY).toEqual([5, 10, 7, 20]);
    }

    {
      const sizingX = getBlockMargin(els, [0, 0, 0, 0], [5, 3, 7, 10], 'x', false);
      expect(sizingX).toEqual([5, 0, 13, 0]);

      const sizingY = getBlockMargin(els, [0, 0, 0, 0], [5, 3, 7, 10], 'y', false);
      expect(sizingY).toEqual([0, 7, 0, 10]);
    }
    
    {
      const sizingX = getBlockMargin(els, [-5, -10, -25, 5], [0, 0, 0, 0], 'x', false);
      expect(sizingX).toEqual([5, -10, -5, 5]);

      const sizingY = getBlockMargin(els, [-5, -10, -25, 5], [0, 0, 0, 0], 'y', false);
      expect(sizingY).toEqual([-5, 0, -25, 20]);
    }
  });

  it("fits block layout X", () => {
    const els = [
      makeElement(50, 50, 10),
      makeElement(20, 20, 20),
    ];

    const size = [110, 80] as Point;
    const {sizes, offsets, renders} = fitBlock(els, size, [0, 0], [0, 0, 0, 0], 'x', false);

    expect(offsets).toEqual([[0, 10], [70, 20]]);
    expect(sizes).toEqual([[50, 50], [20, 20]]);

    const layout = [10, 20, 10 + size[0], 20 + size[1]] as Rectangle;
    const result = makeBoxLayout(sizes, offsets, renders)(layout);
    expect((result as any)[0].layout).toEqual([10, 30, 60, 80]);
  });

  it("fits block layout Y", () => {
    const els = [
      makeElement(50, 50, 10),
      makeElement(20, 20, 20),
    ];

    const size = [110, 80] as Point;
    const {sizes, offsets, renders} = fitBlock(els, size, [0, 0], [0, 0, 0, 0], 'y', false);

    expect(offsets).toEqual([[10, 0], [20, 70]]);
    expect(sizes).toEqual([[50, 50], [20, 20]]);

    const layout = [10, 20, 10 + size[0], 20 + size[1]] as Rectangle;
    const result = makeBoxLayout(sizes, offsets, renders)(layout);
    expect((result as any)[0].layout).toEqual([20, 20, 70, 70]);
  });

});
*/