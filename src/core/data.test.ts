import {
  copyNumberArrays, copyNumberArrayChunked,
  copyNestedNumberArray,
  copyNumberArrayRepeatedRange,
  copyNumberArrayCompositeRange,
  copyDataArraysComposite, copyNumberArraysComposite,
  copyDataArrays, copyDataArrayChunked,
  copyChunksToSegments,
} from './data';

describe('data', () => {

  it('copies nested vec2 number array', () => {
    const data = [[1, 10], [2, 20], [3, 30]];
    const dst = [0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => [o.x, o.y];

    copyNestedNumberArray(data, dst, 2);
    expect(dst).toEqual([1, 10, 2, 20, 3, 30]);
  });
  
  it('copies multiple number arrays into one', () => {
    const src = [[1, 2, 3], [4], [5, 6]];
    const dst = [0, 0, 0, 0, 0, 0];

    copyNumberArrays(src, dst);
    expect(dst).toEqual([1, 2, 3, 4, 5, 6]);
  });
  
  it('copies multiple data arrays into one', () => {
    const src = [{xs: [1, 1, 2, 2, 3, 3]}, {xs: [4, 4]}, {xs: [5, 5, 6, 6]}];
    const dst = [0, 0, 0, 0, 0, 0];

    copyDataArrays(src, dst, 2, (o: any) => o.xs);
    expect(dst).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6]);
  });

  it('copies multiple nested data arrays into one', () => {
    const src = [{xs: [[1, 1], [2, 2], [3, 3]]}, {xs: [[4, 4]]}, {xs: [[5, 5], [6, 6]]}];
    const dst = [0, 0, 0, 0, 0, 0];

    copyDataArrays(src, dst, 2, (o: any) => o.xs);
    expect(dst).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6]);
  });

  it('copies a vec2 value into a repeated array', () => {
    const src = [1, 10];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    copyNumberArrayRepeatedRange(src, dst, 0, 2, 2, 3);
    expect(dst).toEqual([0, 0, 1, 10, 1, 10, 1, 10, 0, 0, 0, 0]);
  });

  it('copies a vec2 value into a repeated array with loop', () => {
    const src = [1, 10];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    copyNumberArrayRepeatedRange(src, dst, 0, 2, 2, 3, true);
    expect(dst).toEqual([0, 0, 1, 10, 1, 10, 1, 10, 1, 10, 1, 10, 1, 10, 0, 0]);
  });

  it('copies number array into repeated chunks', () => {
    const src = [1, 2, 3];
    const dst = [0, 0, 0, 0, 0, 0];

    copyNumberArrayChunked(src, dst, 1, [3, 1, 2], [false, false, false]);
    expect(dst).toEqual([1, 1, 1, 2, 3, 3]);
  });

  it('copies vec2 array into repeated chunks', () => {
    const src = [1, 10, 2, 20, 3, 30];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    copyNumberArrayChunked(src, dst, 2, [3, 1, 2], [false, false, false]);
    expect(dst).toEqual([1, 10, 1, 10, 1, 10, 2, 20, 3, 30, 3, 30]);
  });

  it('copies vec2 array into repeated chunks with loops', () => {
    const src = [1, 10, 2, 20, 3, 30];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    copyNumberArrayChunked(src, dst, 2, [3, 1, 2], [true, false, true]);
    expect(dst).toEqual([1, 10, 1, 10, 1, 10, 1, 10, 1, 10, 1, 10, 2, 20, 3, 30, 3, 30, 3, 30, 3, 30, 3, 30]);
  });

  it('copies vec4 array into repeated chunks', () => {
    const src = [1, 10, 2, 20, 3, 30, 4, 40];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    copyNumberArrayChunked(src, dst, 4, [3, 2], [false, false]);
    expect(dst).toEqual([1, 10, 2, 20, 1, 10, 2, 20, 1, 10, 2, 20, 3, 30, 4, 40, 3, 30, 4, 40]);
  });
  
  it('copies number data array into repeated chunks', () => {
    const data = [{x: 1}, {x: 2}, {x: 3}];
    const dst = [0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => o.x;

    copyDataArrayChunked(data, dst, 1, [3, 1, 2], [false, false, false], accessor);
    expect(dst).toEqual([1, 1, 1, 2, 3, 3]);
  });

  it('copies vec2 data array into repeated chunks', () => {
    const data = [{x: 1, y: 10}, {x: 2, y: 20}, {x: 3, y: 30}];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => [o.x, o.y];

    copyDataArrayChunked(data, dst, 2, [3, 1, 2], [false, false, false], accessor);
    expect(dst).toEqual([1, 10, 1, 10, 1, 10, 2, 20, 3, 30, 3, 30]);
  });

  it('copies vec2 data array into repeated chunks with loops', () => {
    const data = [{x: 1, y: 10}, {x: 2, y: 20}, {x: 3, y: 30}];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => [o.x, o.y];

    copyDataArrayChunked(data, dst, 2, [3, 1, 2], [true, false, true], accessor);
    expect(dst).toEqual([1, 10, 1, 10, 1, 10, 1, 10, 1, 10, 1, 10, 2, 20, 3, 30, 3, 30, 3, 30, 3, 30, 3, 30]);
  });

  it('copies vec4 array into repeated chunks', () => {
    const data = [{x: 1, y: 10, z: 2, w: 20}, {x: 3, y: 30, z: 4, w: 40}];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => [o.x, o.y, o.z, o.w];

    copyDataArrayChunked(data, dst, 4, [3, 2], [false, false], accessor);
    expect(dst).toEqual([1, 10, 2, 20, 1, 10, 2, 20, 1, 10, 2, 20, 3, 30, 4, 40, 3, 30, 4, 40]);
  });

  it('copies chunks to segments', () => {
    const chunks = [3, 2, 5, 1, 4];
    const loops = [0, 0, 1, 0, 0] as any as boolean[];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    copyChunksToSegments(dst, chunks, loops);
    expect(dst).toEqual([1, 3, 2, 1, 2, 0, 3, 3, 3, 3, 3, 0, 0, 0, 1, 3, 3, 2])
  });
  
  it('copies flat composite number array with loops', () => {
    const data = [1, 1, 2, 2, 3, 3];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    copyNumberArrayCompositeRange(data, dst, 0, 2, 2, 3, true);
    expect(dst).toEqual([0, 0, 3, 3, 1, 1, 2, 2, 3, 3, 1, 1, 2, 2, 0, 0]);
  });

  it('copies flat composite number arrays with loops', () => {
    const data = [[1, 1, 2, 2, 3, 3], [1, 1], [4, 4, 5, 5]];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    copyNumberArraysComposite(data, dst, 2, [3, 1, 2], [true, false, true]);
    expect(dst).toEqual([3, 3, 1, 1, 2, 2, 3, 3, 1, 1, 2, 2, 1, 1, 5, 5, 4, 4, 5, 5, 4, 4, 5, 5]);
  });

  it('copies nested composite number arrays with loops', () => {
    const data = [[[1, 1], [2, 2], [3, 3]], [[1, 1]], [[4, 4], [5, 5]]];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    copyNumberArraysComposite(data, dst, 2, [3, 1, 2], [true, false, true]);
    expect(dst).toEqual([3, 3, 1, 1, 2, 2, 3, 3, 1, 1, 2, 2, 1, 1, 5, 5, 4, 4, 5, 5, 4, 4, 5, 5]);
  });

  it('copies flat composite data arrays with loops', () => {
    const data = [{xs: [1, 1, 2, 2, 3, 3]}, {xs: [1, 1]}, {xs: [4, 4, 5, 5]}];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => o.xs;

    copyDataArraysComposite(data, dst, 2, [3, 1, 2], [true, false, true], accessor);
    expect(dst).toEqual([3, 3, 1, 1, 2, 2, 3, 3, 1, 1, 2, 2, 1, 1, 5, 5, 4, 4, 5, 5, 4, 4, 5, 5]);
  });
  
  it('copies nested composite data arrays with loops', () => {
    const data = [{xs: [[1, 1], [2, 2], [3, 3]]}, {xs: [[1, 1]]}, {xs: [[4, 4], [5, 5]]}];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => o.xs;

    copyDataArraysComposite(data, dst, 2, [3, 1, 2], [true, false, true], accessor);
    expect(dst).toEqual([3, 3, 1, 1, 2, 2, 3, 3, 1, 1, 2, 2, 1, 1, 5, 5, 4, 4, 5, 5, 4, 4, 5, 5]);
  });
});