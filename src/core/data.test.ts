import {
  flattenIndexedArray,
  copyNumberArray,
  copyNumberArrays, copyNumberArrayChunked,
  copyNestedNumberArray,
  copyNumberArrayRepeatedRange,
  copyNumberArrayCompositeRange,
  copyDataArraysComposite, copyNumberArraysComposite,
  copyDataArrays, copyDataArrayChunked,
  generateChunkSegments,
} from './data';

describe('data', () => {

  it('flattens indexed array', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8];
    const inds = [0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7];
    const dst = flattenIndexedArray(data, inds);
    expect(Array.from(dst)).toEqual([1, 2, 3, 3, 2, 4, 5, 6, 7, 7, 6, 8]);
  });

  it('flattens indexed vec3 array', () => {
    const data = [1, 10, 2, 2, 20, 4, 3, 30, 6, 4, 40, 8, 5, 50, 10, 6, 60, 12, 7, 70, 14, 8, 80, 16];
    const inds = [0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7];
    const dst = flattenIndexedArray(data, inds, 3);
    expect(Array.from(dst)).toEqual([1, 10, 2, 2, 20, 4, 3, 30, 6, 3, 30, 6, 2, 20, 4, 4, 40, 8, 5, 50, 10, 6, 60, 12, 7, 70, 14, 7, 70, 14, 6, 60, 12, 8, 80, 16]);
  });

  it('flattens indexed vec3to4 array', () => {
    const data = [1, 10, 2, 2, 20, 4, 3, 30, 6, 4, 40, 8, 5, 50, 10, 6, 60, 12, 7, 70, 14, 8, 80, 16];
    const inds = [0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7];
    const dst = flattenIndexedArray(data, inds, 3.5);
    expect(Array.from(dst)).toEqual([1, 10, 2, 0, 2, 20, 4, 0, 3, 30, 6, 0, 3, 30, 6, 0, 2, 20, 4, 0, 4, 40, 8, 0, 5, 50, 10, 0, 6, 60, 12, 0, 7, 70, 14, 0, 7, 70, 14, 0, 6, 60, 12, 0, 8, 80, 16, 0]);
  });

  it('copies number array', () => {
    const data = [0, 1, 2, 3, 4, 5, 6, 7];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0];

    copyNumberArray(data, dst, 4);
    expect(dst).toEqual(data);
  });

  it('copies vec3to4 number array', () => {
    const data = [0, 1, 2, 3, 4, 5];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0];

    copyNumberArray(data, dst, 3.5);
    expect(dst).toEqual([0, 1, 2, 0, 3, 4, 5, 0]);
  });
  
  it('copies nested vec2 number array', () => {
    const data = [[1, 10], [2, 20], [3, 30]];
    const dst = [0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => [o.x, o.y];

    copyNestedNumberArray(data, dst, 2);
    expect(dst).toEqual([1, 10, 2, 20, 3, 30]);
  });
  
  it('copies nested vec3to4 number array', () => {
    const data = [[1, 10, 4], [2, 20, 5], [3, 30, 6]];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => [o.x, o.y];

    copyNestedNumberArray(data, dst, 3.5);
    expect(dst).toEqual([1, 10, 4, 0, 2, 20, 5, 0, 3, 30, 6, 0]);
  });

  it('copies multiple number arrays into one', () => {
    const src = [[1, 2, 3], [4], [5, 6]];
    const dst = [0, 0, 0, 0, 0, 0];

    copyNumberArrays(src, dst, 1);
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
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    copyDataArrays(src, dst, 2, (o: any) => o.xs);
    expect(dst).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6]);
  });

  it('copies multiple vec3to4 arrays into one', () => {
    const src = [[1, 2, 3, 4, 5, 6], [7, 8, 9], [10, 11, 12, 13, 14, 15]];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    copyNumberArrays(src, dst, 3.5);
    expect(dst).toEqual([1, 2, 3, 0, 4, 5, 6, 0, 7, 8, 9, 0, 10, 11, 12, 0, 13, 14, 15, 0]);
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

  it('copies a vec3to4 value into a repeated array with loop', () => {
    const src = [1, 10, 2];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    copyNumberArrayRepeatedRange(src, dst, 0, 4, 3.5, 3, true);
    expect(dst).toEqual([0, 0, 0, 0, 1, 10, 2, 0, 1, 10, 2, 0, 1, 10, 2, 0, 1, 10, 2, 0, 1, 10, 2, 0, 1, 10, 2, 0, 0, 0, 0, 0]);
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

  it('copies indexed number array into repeated chunks', () => {
    const src = [0, 0, 0];
    const dst = [0, 0, 0, 0, 0, 0];

    copyNumberArrayChunked(src, dst, 1, [3, 1, 2], [false, false, false], [0, 3, 4]);
    expect(dst).toEqual([0, 0, 0, 3, 4, 4]);
  });
  
  it('copies number data array into repeated chunks', () => {
    const data = [{x: 1}, {x: 2}, {x: 3}];
    const dst = [0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => o.x;

    copyDataArrayChunked(data, dst, 1, accessor, [3, 1, 2], [false, false, false]);
    expect(dst).toEqual([1, 1, 1, 2, 3, 3]);
  });

  it('copies vec2 data array into repeated chunks', () => {
    const data = [{x: 1, y: 10}, {x: 2, y: 20}, {x: 3, y: 30}];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => [o.x, o.y];

    copyDataArrayChunked(data, dst, 2, accessor, [3, 1, 2], [false, false, false]);
    expect(dst).toEqual([1, 10, 1, 10, 1, 10, 2, 20, 3, 30, 3, 30]);
  });

  it('copies vec2 data array into repeated chunks with loops', () => {
    const data = [{x: 1, y: 10}, {x: 2, y: 20}, {x: 3, y: 30}];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => [o.x, o.y];

    copyDataArrayChunked(data, dst, 2, accessor, [3, 1, 2], [true, false, true]);
    expect(dst).toEqual([1, 10, 1, 10, 1, 10, 1, 10, 1, 10, 1, 10, 2, 20, 3, 30, 3, 30, 3, 30, 3, 30, 3, 30]);
  });

  it('copies vec4 array into repeated chunks', () => {
    const data = [{x: 1, y: 10, z: 2, w: 20}, {x: 3, y: 30, z: 4, w: 40}];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => [o.x, o.y, o.z, o.w];

    copyDataArrayChunked(data, dst, 4, accessor, [3, 2], [false, false]);
    expect(dst).toEqual([1, 10, 2, 20, 1, 10, 2, 20, 1, 10, 2, 20, 3, 30, 4, 40, 3, 30, 4, 40]);
  });

  it('copies indexed number data array into repeated chunks', () => {
    const data = [{x: 0}, {x: 0}, {x: 0}];
    const dst = [0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => o.x;

    copyDataArrayChunked(data, dst, 1, accessor, [3, 1, 2], [false, false, false], [0, 3, 4]);
    expect(dst).toEqual([0, 0, 0, 3, 4, 4]);
  });

  it('generates chunk segments', () => {
    const chunks = [3, 2, 5, 1, 4];
    const loops = [0, 0, 1, 0, 0] as any as boolean[];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    generateChunkSegments(dst, null, chunks, loops);
    expect(dst).toEqual([1, 3, 2, 1, 2, 0, 3, 3, 3, 3, 3, 0, 0, 0, 1, 3, 3, 2]);
  });

  it('generates chunk segments w/ lookup', () => {
    const chunks = [3, 2, 5, 1, 4];
    const loops = [0, 0, 1, 0, 0] as any as boolean[];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const lookup = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    generateChunkSegments(dst, lookup, chunks, loops);
    expect(dst).toEqual([1, 3, 2, 1, 2, 0, 3, 3, 3, 3, 3, 0, 0, 0, 1, 3, 3, 2]);
    expect(lookup).toEqual([0, 0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 4, 4, 4, 4]);
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

  it('copies indexed flat composite number arrays with loops', () => {
    const data = [[0, 0, 1, 1, 2, 2], [0, 0], [0, 0, 1, 1]];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    copyNumberArraysComposite(data, dst, 2, [3, 1, 2], [true, false, true], [0, 3, 4]);
    expect(dst).toEqual([
      2, 2, 0, 0, 1, 1, 2, 2, 0, 0, 1, 1,
      3, 3,
      5, 5, 4, 4, 5, 5, 4, 4, 5, 5,
    ]);
  });

  it('copies indexed nested composite number arrays with loops', () => {
    const data = [[[0, 0], [1, 1], [2, 2]], [[0, 0]], [[0, 0], [1, 1]]];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    copyNumberArraysComposite(data, dst, 2, [3, 1, 2], [true, false, true], [0, 3, 4]);
    expect(dst).toEqual([
      2, 2, 0, 0, 1, 1, 2, 2, 0, 0, 1, 1,
      3, 3,
      5, 5, 4, 4, 5, 5, 4, 4, 5, 5,
    ]);
  });

  it('copies flat composite data arrays with loops', () => {
    const data = [{xs: [1, 1, 2, 2, 3, 3]}, {xs: [1, 1]}, {xs: [4, 4, 5, 5]}];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => o.xs;

    copyDataArraysComposite(data, dst, 2, accessor, [3, 1, 2], [true, false, true]);
    expect(dst).toEqual([3, 3, 1, 1, 2, 2, 3, 3, 1, 1, 2, 2, 1, 1, 5, 5, 4, 4, 5, 5, 4, 4, 5, 5]);
  });
  
  it('copies nested composite data arrays with loops', () => {
    const data = [{xs: [[1, 1], [2, 2], [3, 3]]}, {xs: [[1, 1]]}, {xs: [[4, 4], [5, 5]]}];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => o.xs;

    copyDataArraysComposite(data, dst, 2, accessor, [3, 1, 2], [true, false, true]);
    expect(dst).toEqual([3, 3, 1, 1, 2, 2, 3, 3, 1, 1, 2, 2, 1, 1, 5, 5, 4, 4, 5, 5, 4, 4, 5, 5]);
  });

  it('copies indexed flat composite data arrays with loops', () => {
    const data = [{xs: [0, 0, 1, 1, 2, 2]}, {xs: [0, 0]}, {xs: [0, 0, 1, 1]}];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => o.xs;

    copyDataArraysComposite(data, dst, 2, accessor, [3, 1, 2], [true, false, true], [0, 3, 4]);
    expect(dst).toEqual([
      2, 2, 0, 0, 1, 1, 2, 2, 0, 0, 1, 1,
      3, 3,
      5, 5, 4, 4, 5, 5, 4, 4, 5, 5,
    ]);
  });
  
  it('copies nested composite data arrays with loops', () => {
    const data = [{xs: [[0, 0], [1, 1], [2, 2]]}, {xs: [[0, 0]]}, {xs: [[0, 0], [1, 1]]}];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const accessor = (o: any) => o.xs;

    copyDataArraysComposite(data, dst, 2, accessor, [3, 1, 2], [true, false, true], [0, 3, 4]);
    expect(dst).toEqual([
      2, 2, 0, 0, 1, 1, 2, 2, 0, 0, 1, 1,
      3, 3,
      5, 5, 4, 4, 5, 5, 4, 4, 5, 5,
    ]);
  });
  
});