import {
  generateChunkSegments,
} from './segments';

describe('segments', () => {

  it('generates chunk segments', () => {
    const chunks = [3, 2, 5, 1, 4];
    const loops = [0, 0, 1, 0, 0] as any as boolean[];
    const dst = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    generateChunkSegments(dst, null, null, chunks, null, loops);
    expect(dst).toEqual([1, 3, 2, 1, 2, 0, 3, 3, 3, 3, 3, 0, 0, 0, 1, 3, 3, 2]);
  });

});