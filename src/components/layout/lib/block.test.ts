import { LayoutState, Rectangle, Sizing, Point, Margin } from '../types';
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

    const sizingX = getBlockMinMax(els, 'x');
    expect(sizingX).toEqual([70, 50, 70, 50]);

    const sizingY = getBlockMinMax(els, 'y');
    expect(sizingY).toEqual([50, 70, 50, 70]);
  });

  it("gets block margin", () => {
    const els = [
      makeElement(50, 50, 10),
      makeElement(20, 20, 20),
    ];

    const sizingX = getBlockMargin(els, [0, 0, 0, 0], [0, 0, 0, 0], 'x');
    expect(sizingX).toEqual([10, 0, 20, 0]);

    const sizingY = getBlockMargin(els, [0, 0, 0, 0], [0, 0, 0, 0], 'y');
    expect(sizingY).toEqual([0, 10, 0, 20]);
  });
  
  it("gets merged block margin", () => {
    const els = [
      makeElement(50, 50, 10),
      makeElement(20, 20, 20),
    ];

    const sizingX = getBlockMargin(els, [-5, -10, -25, 5], [0, 0, 0, 0], 'x');
    expect(sizingX).toEqual([5, -10, -5, 5]);

    const sizingY = getBlockMargin(els, [-5, -10, -25, 5], [0, 0, 0, 0], 'y');
    expect(sizingY).toEqual([-5, 0, -25, 20]);
  });

  it("fits block layout X", () => {
    const els = [
      makeElement(50, 50, 10),
      makeElement(20, 20, 20),
    ];

    const size = [110, 80] as Point;
    const {sizes, offsets, renders} = fitBlock(els, size, [0, 0], [0, 0, 0, 0], 'x');

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
    const {sizes, offsets, renders} = fitBlock(els, size, [0, 0], [0, 0, 0, 0], 'y');

    expect(offsets).toEqual([[10, 0], [20, 70]]);
    expect(sizes).toEqual([[50, 50], [20, 20]]);

    const layout = [10, 20, 10 + size[0], 20 + size[1]] as Rectangle;
    const result = makeBoxLayout(sizes, offsets, renders)(layout);
    expect((result as any)[0].layout).toEqual([20, 20, 70, 70]);
  });

});