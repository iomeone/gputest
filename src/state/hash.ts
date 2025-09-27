const HASH_KEY = 0xf1c3a587;

const C1 = 0xcc9e2d51;
const C2 = 0x1b873593;
const C3 = 0xe6546b64;
const C4 = 0x85ebca6b;
const C5 = 0xc2b2ae35;

const add = (a: number, b: number) => ((a|0) + (b|0)) >>> 0;
const rot = (a: number, b: number) => ((a << b) | (a >>> (32 - b))) >>> 0;
const mul = Math.imul;

export const toUint53 = (a: number, b: number) => {
  return a + ((b & 0x1fffff) * 0x100000000);
}

export const formatHash = (uint: number) => {
  return uint.toString(36).slice(-10);
}

export const getHash = <T>(t: T) => formatHash(getHashValue(t));

export const getHashValue = (s: any) => {
  if (typeof s === 'string') return getStringHash(s);
  if (typeof s === 'number') return getNumberHash(s);
  if (typeof s === 'boolean') return getBooleanHash(s);
  if (s === undefined) return scrambleBits53(mixBits53(HASH_KEY, 1));
  if (s === null) return scrambleBits53(mixBits53(HASH_KEY, 2));
  if (Array.isArray(s)) return getArrayHash(s);
  if (isTypedArray(s)) return getTypedArrayHash(s);
  if (s) return getObjectHash(s);
  
  return scrambleBits53(mixBits53(HASH_KEY, -1));
}

export const getStringHash  = (s: string) => stringToMurmur53(s, HASH_KEY + 15);

const f64 = new Float64Array(1);
const uint32 = new Uint32Array(f64.buffer);
export const getNumberHash  = (n: number) => {
  f64[0] = n;
  let k = HASH_KEY + 63;
  k = mixBits53(k, uint32[0]);
  k = mixBits53(k, uint32[1]);
  return k;
}

export const getBooleanHash = (b: boolean) => scrambleBits53(mixBits53(HASH_KEY + 255, +b));

export const getArrayHash = (t: any[]) => {
  let h = mixBits53(HASH_KEY + 1023, 0);
  for (let v of t) h = mixBits53(h, getHashValue(v));
  return scrambleBits53(h, t.length);
}

export const getObjectHash = (t: Record<string, any>) => {
  let i = 0;
  let h = mixBits53(HASH_KEY + 4095, 0);
  for (let k in t) {
    h = mixBits53(h, getHashValue(k));
    h = mixBits53(h, getHashValue(t[k]));
    ++i;
  }
  return scrambleBits53(h, i);
}

export type TypedArray =
  Int8Array |
  Uint8Array |
  Int16Array |
  Uint16Array |
  Int32Array |
  Uint32Array |
  Uint8ClampedArray |
  Float32Array |
  Float64Array;

const isTypedArray = (() => {
  const TypedArray = Object.getPrototypeOf(Uint8Array);
  return (obj: any) => obj instanceof TypedArray;
})();
  
export const getTypedArrayHash = (t: TypedArray) => {
  let h = mixBits53(HASH_KEY + 16383, 0);

  if (
    t instanceof Int8Array ||
    t instanceof Uint8Array ||
    t instanceof Int16Array ||
    t instanceof Uint16Array ||
    t instanceof Int32Array ||
    t instanceof Uint32Array ||
    t instanceof Uint8ClampedArray
  ) {
    h = arrayToMurmur53(t, h);
  }
  else {
    let n = t.length;
    for (let i = 0; i < n; ++i) h = mixBits53(h, getNumberHash(t[i]));
  }

  return scrambleBits53(h);
}

export const mixBits = (x: number, d: number) => {
  d = mul(d, C1);
  d = rot(d, 15);
  d = mul(d, C2);

  x ^= d;
  x = rot(x, 13);
  x = add(mul(x, 5), C3);

  return x;
};

export const scrambleBits = (x: number, n: number = 0) => {
  x ^= n;
  
  x ^= x >>> 16;
  x = mul(x, C4);
  x ^= x >>> 13;
  x = mul(x, C5);
  x ^= x >>> 16;

  return x;
};

export const mixBits53 = (x: number, d: number) => {
  let a = (x & 0xffffffff) >>> 0;
  let b = Math.floor(x / 0x100000000);

  let d1 = add(d << 8, b);
  let d2 = add(d, a);

  d1 = mul(d1, C1);
  d1 = rot(d1, 15);
  d1 = mul(d1, C2);

  a ^= d1;
  a = rot(a, 13);
  a = add(mul(a, 5), C3);

  d2 = mul(d2, C1);
  d2 = rot(d2, 15);
  d2 = mul(d2, C2);

  b ^= d2;
  b = rot(b, 13);
  b = add(mul(b, 5), C3);

  return toUint53(a, b);
};

export const scrambleBits53 = (x: number, n: number = 0) => {
  let a = (x & 0xffffffff) >>> 0;
  let b = Math.floor(x / 0x100000000);

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

  return toUint53(a, b);
};

export const arrayToMurmur53 = (list: number[] | TypedArray, seed: number = 0) => {
  const n = list.length;
  
  let a = seed;
  let b = seed ^ C4;

  for (let i = 0; i < n; ++i) {
    let d = list[i];
    let d1 = add(d << 8, b);
    let d2 = add(d, a);

    d1 = mul(d1, C1);
    d1 = rot(d1, 15);
    d1 = mul(d1, C2);

    a ^= d1;
    a = rot(a, 13);
    a = add(mul(a, 5), C3);

    d2 = mul(d2, C1);
    d2 = rot(d2, 15);
    d2 = mul(d2, C2);

    b ^= d2;
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

  return toUint53(a, b);
}

export const stringToMurmur53 = (s: string, seed: number = 0) => {
  const n = s.length;
  let a = seed;
  let b = seed ^ C4;

  for (let i = 0; i < n; ++i) {
    let d = s.charCodeAt(i);
    let d1 = add(d << 8, b);
    let d2 = add(d, a);

    d1 = mul(d1, C1);
    d1 = rot(d1, 15);
    d1 = mul(d1, C2);

    a ^= d1;
    a = rot(a, 13);
    a = add(mul(a, 5), C3);

    d2 = mul(d2, C1);
    d2 = rot(d2, 15);
    d2 = mul(d2, C2);

    b ^= d2;
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

  return toUint53(a, b);
}

export const toMurmur53 = stringToMurmur53;
