import {
  copyNumberArray,
  copyRecursiveNumberArray,
  unweldNumberArray,
} from './data';

describe('data', () => {

  it('flattens indexed array', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8];
    const inds = [0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7];

    const dst = new Uint32Array(inds.length);
    unweldNumberArray(data, dst, inds, 1, 1, 0, 0, inds.length);
    expect(Array.from(dst)).toEqual([1, 2, 3, 3, 2, 4, 5, 6, 7, 7, 6, 8]);
  });

  it('flattens indexed vec3 array', () => {
    const data = [1, 10, 2, 2, 20, 4, 3, 30, 6, 4, 40, 8, 5, 50, 10, 6, 60, 12, 7, 70, 14, 8, 80, 16];
    const inds = [0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7];

    const dst = new Uint32Array(inds.length * 3);
    unweldNumberArray(data, dst, inds, 3, 3, 0, 0, inds.length);
    expect(Array.from(dst)).toEqual([1, 10, 2, 2, 20, 4, 3, 30, 6, 3, 30, 6, 2, 20, 4, 4, 40, 8, 5, 50, 10, 6, 60, 12, 7, 70, 14, 7, 70, 14, 6, 60, 12, 8, 80, 16]);
  });

  it('flattens indexed vec3to4 array', () => {
    const data = [1, 10, 2, 2, 20, 4, 3, 30, 6, 4, 40, 8, 5, 50, 10, 6, 60, 12, 7, 70, 14, 8, 80, 16];
    const inds = [0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7];

    const dst = new Uint32Array(inds.length * 4);
    unweldNumberArray(data, dst, inds, 3, 4, 0, 0, inds.length);
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

    copyNumberArray(data, dst, 3, 4);
    expect(dst).toEqual([0, 1, 2, 0, 3, 4, 5, 0]);
  });

  it('copies nested vec2 number array', () => {
    const data = [[1, 10], [2, 20], [3, 30]];
    const dst = [0, 0, 0, 0, 0, 0];

    copyRecursiveNumberArray(data, dst, 2, 2, 1, 0);
    expect(dst).toEqual([1, 10, 2, 20, 3, 30]);
  });

  it('copies nested vec3to4 number array', () => {
    const data = [[1, 10, 4], [2, 20, 5], [3, 30, 6]];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    copyRecursiveNumberArray(data, dst, 3, 4, 1, 0);
    expect(dst).toEqual([1, 10, 4, 0, 2, 20, 5, 0, 3, 30, 6, 0]);
  });

});