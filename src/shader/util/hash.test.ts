import {add, mul, rot} from './hash';

describe("hash", () => {
  it("arithmetic", () => {
    expect(add(1, 1)).toEqual(2);
    expect(add(0x7fffffff, 1)).toEqual(0x80000000);
    expect(add(0xffffffff, 1)).toEqual(0);

    expect(mul(0x1000, 0x1000)).toEqual(0x1000000);
    expect(mul(0x7fffffff, 0x2)).toEqual(-2);
    expect(mul(0x80000001, 0x2)).toEqual(0x2);
    expect(mul(0x80000001, 0x80000001)).toEqual(0x1);

    expect(rot(0x7fffff00, 31)).toEqual(0x3fffff80);
    expect(rot(0x80000001, 31)).toEqual(0xc0000000);
  })
});