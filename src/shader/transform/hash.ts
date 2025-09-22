export const C1 = 0xcc9e2d51;
export const C2 = 0x1b873593;
export const C3 = 0xe6546b64;
export const C4 = 0x85ebca6b;
export const C5 = 0xc2b2ae35;

export const add = (a: number, b: number) => ((a|0) + (b|0)) >>> 0;
export const rot = (a: number, b: number) => ((a << b) | (a >>> (32 - b))) >>> 0;
export const mul = Math.imul;

export const toMurmur53 = (s: string, seed: number = 0) => {
  const n = s.length;
  let a = seed;
  let b = seed ^ C4;

  for (let i = 0; i < n; ++i) {
    let k;
    let d = s.charCodeAt(i);
    let d1 = add(d, b);
    let d2 = add(d, a);

    k = mul(d1, C1);
    k = rot(k, 15);
    k = mul(k, C2);

    a ^= k;
    a = rot(a, 13);
    a = add(mul(a, 5), C3);

    k = mul(d2, C1);
    k = rot(k, 15);
    k = mul(k, C2);

    b ^= k;
    b = rot(b, 13);
    b = add(mul(b, 5), C3);
  }

  a ^= n;
  b ^= n;

  a ^= a >>> 16;
  a = mul(a, C4);
  a ^= a >>> 13;
  a = mul(a, C5);
  a ^= a >>> 16;
  
  b ^= b >>> 16;
  b = mul(b, C4);
  b ^= b >>> 13;
  b = mul(b, C5);
  b ^= b >>> 16;

  return a + ((b & 0x1fffff) * 0x100000000);
}
