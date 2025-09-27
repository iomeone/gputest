import { Rectangle, Point, Margin, Sizing } from '../types';
import { getFlexMinMax, fitFlex } from './flex';
import { makeBoxLayout } from './util';

describe('flex layout', () => {
  
  /*
  let ID = 0;
  const makeElement = (
    width: number,
    height: number,
    grow: number = 0,
    shrink: number = 0,
    m: number = 0,
  ) => {
    const sizing = [width, height, width, height] as Sizing;
    const margin = [m, m, m, m] as Margin;
    return {
      key: ++ID,
      sizing,
      margin,
      grow,
      shrink,
      fit: () => ({
        size: [width, height] as Point,
        render: (layout: Rectangle) => ({layout}) as any,
      }),
    };
  };
  
  it("gets flex min/max", () => {
    const els = [
      makeElement(50, 50),
      makeElement(20, 20),
    ];

    const sizingX = getFlexMinMax(els, 'x', [0, 0], false, false);
    expect(sizingX).toEqual([70, 50, 70, 50]);

    const sizingY = getFlexMinMax(els, 'y', [0, 0], false, false);
    expect(sizingY).toEqual([50, 70, 50, 70]);
  });

  it("fits flex layout X", () => {
    const els = [
      makeElement(50, 50, 0, 0, 10),
      makeElement(20, 20, 0, 0, 20),
    ];

    const size = [110, 80] as Point;
    const {sizes, offsets, renders} = fitFlex(els, size, 'x', [0, 0], 'start', 'start', 'start', false, true);

    expect(offsets).toEqual([[10, 10], [90, 20]]);
    expect(sizes).toEqual([[50, 50], [20, 20]]);

    const layout = [10, 20, 10 + size[0], 20 + size[1]] as Rectangle;
    const result = makeBoxLayout(sizes, offsets, renders)(layout);
    expect((result as any)[0].layout).toEqual([20, 30, 70, 80]);
  });

  it("fits flex layout Y", () => {
    const els = [
      makeElement(50, 50, 0, 0, 10),
      makeElement(20, 20, 0, 0, 20),
    ];

    const size = [110, 80] as Point;
    const {sizes, offsets, renders} = fitFlex(els, size, 'y', [0, 0], 'start', 'start', 'start', false, true);

    expect(offsets).toEqual([[10, 10], [20, 90]]);
    expect(sizes).toEqual([[50, 50], [20, 20]]);

    const layout = [10, 20, 10 + size[0], 20 + size[1]] as Rectangle;
    const result = makeBoxLayout(sizes, offsets, renders)(layout);
    expect((result as any)[0].layout).toEqual([20, 30, 70, 80]);
  });

  it("fits flex layout X with grow", () => {
    const els = [
      makeElement(50, 50, 1, 0, 10),
      makeElement(20, 20, 1, 0, 20),
    ];

    const size = [180, 80] as Point;
    const {sizes, offsets, renders} = fitFlex(els, size, 'x', [0, 0], 'start', 'start', 'start', false, true);

    expect(offsets).toEqual([[10, 10], [115, 20]]);
    expect(sizes).toEqual([[75, 50], [45, 20]]);

    const layout = [10, 20, 10 + size[0], 20 + size[1]] as Rectangle;
    const result = makeBoxLayout(sizes, offsets, renders)(layout);
    expect((result as any)[0].layout).toEqual([20, 30, 95, 80]);
  });

  it("fits flex layout X with shrink", () => {
    const els = [
      makeElement(50, 50, 0, 1, 10),
      makeElement(20, 20, 0, 1, 20),
    ];

    const size = [70, 80] as Point;
    const {sizes, offsets, renders} = fitFlex(els, size, 'x', [0, 0], 'start', 'start', 'start', false, true);

    expect(offsets).toEqual([[10, 10], [47, 20]]);
    expect(sizes).toEqual([[7, 50], [3, 20]]);

    const layout = [10, 20, 10 + size[0], 20 + size[1]] as Rectangle;
    const result = makeBoxLayout(sizes, offsets, renders)(layout);
    expect((result as any)[0].layout).toEqual([20, 30, 27, 80]);
  });

  it("fits flex layout X with even", () => {
    const els = [
      makeElement(50, 50, 0, 0, 10),
      makeElement(20, 20, 0, 0, 20),
    ];

    const size = [180, 80] as Point;
    const {sizes, offsets, renders} = fitFlex(els, size, 'x', [0, 0], 'evenly', 'evenly', 'start', false, true);

    expect(offsets).toEqual([[27, 25], [123, 35]]);
    expect(sizes).toEqual([[50, 50], [20, 20]]);

    const layout = [10, 20, 10 + size[0], 20 + size[1]] as Rectangle;
    const result = makeBoxLayout(sizes, offsets, renders)(layout);
    expect((result as any)[0].layout).toEqual([37, 45, 87, 95]);
  });

  it("fits flex layout X with align", () => {
    const els = [
      makeElement(50, 50, 0, 0, 10),
      makeElement(20, 20, 0, 0, 20),
    ];

    const size = [180, 80] as Point;
    const {sizes, offsets, renders} = fitFlex(els, size, 'x', [0, 0], 'center', 'center', 'start', false, true);

    expect(offsets).toEqual([[35, 25], [115, 35]]);
    expect(sizes).toEqual([[50, 50], [20, 20]]);

    const layout = [10, 20, 10 + size[0], 20 + size[1]] as Rectangle;
    const result = makeBoxLayout(sizes, offsets, renders)(layout);
    expect((result as any)[0].layout).toEqual([45, 45, 95, 95]);
  });

  it("fits flex layout X with anchor", () => {
    const els = [
      makeElement(50, 50, 0, 0, 10),
      makeElement(20, 20, 0, 0, 20),
    ];

    const size = [180, 80] as Point;
    const {sizes, offsets, renders} = fitFlex(els, size, 'x', [0, 0], 'start', 'start', 'center', false, true);

    expect(offsets).toEqual([[10, 10], [90, 35]]);
    expect(sizes).toEqual([[50, 50], [20, 20]]);

    const layout = [10, 20, 10 + size[0], 20 + size[1]] as Rectangle;
    const result = makeBoxLayout(sizes, offsets, renders)(layout);
    expect((result as any)[0].layout).toEqual([20, 30, 70, 80]);
  });

  it("fits flex layout X with wrap", () => {
    const els = [
      makeElement(50, 50, 0, 0, 10),
      makeElement(50, 50, 1, 0, 10),
      makeElement(20, 20, 0, 0, 20),
      makeElement(80, 50, 0, 0, 10),
      makeElement(20, 20, 0, 0, 20),
    ];

    const size = [180, 180] as Point;
    const {sizes, offsets, renders} = fitFlex(els, size, 'x', [0, 0], 'start', 'start', 'start', true, true);

    expect(offsets).toEqual([[10, 10], [80, 10], [20, 70], [70, 60], [20, 120]]);
    expect(sizes).toEqual([[50, 50], [90, 50], [20, 20], [80, 50], [20, 20]]);

    const layout = [10, 20, 10 + size[0], 20 + size[1]] as Rectangle;
    const result = makeBoxLayout(sizes, offsets, renders)(layout);
    expect((result as any)[0].layout).toEqual([20, 30, 70, 80]);
  });
  */

});