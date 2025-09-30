import type { Image } from './types';
import { glyphToEDT } from './sdf-edt';
import { glyphToESDT } from './sdf-esdt';
import { fill } from './fill';

export { paintSubpixelOffsets } from './sdf-esdt';

export const INF = 1e10;

export type Rectangle = [number, number, number, number];

export type SDFStage = {
  outer: Float32Array,
  inner: Float32Array,

  xo: Float32Array,
  yo: Float32Array,
  xi: Float32Array,
  yi: Float32Array,

  f: Float32Array,
  z: Float32Array,
  b: Float32Array,
  t: Float32Array,
  v: Uint16Array,

  size: number,
};

// Singleton scratch workspace
export const makeSDFStage = (size: number) => {
  const n = size * size;

  const outer = new Float32Array(n);
  const inner = new Float32Array(n);

  const xo = new Float32Array(n);
  const yo = new Float32Array(n);
  const xi = new Float32Array(n);
  const yi = new Float32Array(n);

  const f = new Float32Array(size);
  const z = new Float32Array(size + 1);
  const b = new Float32Array(size);
  const t = new Float32Array(size);
  const v = new Uint16Array(size);

  return {outer, inner, xo, yo, xi, yi, f, z, b, t, v, size};
}

let SDF_STAGE: SDFStage | null = null;
export const getSDFStage = (size: number) => {
  if (!SDF_STAGE || SDF_STAGE.size < size) {
    SDF_STAGE = makeSDFStage(size);
  }
  return SDF_STAGE;
}

// Helpers
export const isBlack = (x: number) => !x;
export const isWhite = (x: number) => x === 1;
export const isSolid = (x: number) => !(x && 1-x);

export const sqr = (x: number) => x * x;
export const seq = (n: number, start: number = 0, step: number = 1) => Array.from({length: n}).map((_, i) => start + i * step);

// Pad rectangle by size
export const padRectangle = ([l, t, r, b]: Rectangle, pad: number) => [l - pad, t - pad, r + pad, b + pad] as Rectangle;

// Convert grayscale glyph to SDF
export const glyphToSDF = (
  data: Uint8Array,
  w: number,
  h: number,
  pad: number = 4,
  radius: number = 3,
  cutoff: number = 0.25,
  subpixel: boolean = true,
  solidify: boolean = true,
  preprocess: boolean = false,
  postprocess: boolean = false,
  debug?: (image: Image) => void,
): Image => {
  if (solidify) solidifyAlpha(data, w, h);
  if (subpixel) return glyphToESDT(data, null, w, h, pad, radius, cutoff, preprocess, postprocess, debug);
  else return glyphToEDT(data, w, h, pad, radius, cutoff, debug);
}

// Convert color glyph to SDF
export const rgbaToSDF = (
  data: Uint8Array,
  w: number,
  h: number,
  pad: number = 4,
  radius: number = 3,
  cutoff: number = 0.25,
  subpixel: boolean = true,
  solidify: boolean = true,
  preprocess: boolean = false,
  postprocess: boolean = false,
  debug?: (image: Image) => void,
): Image => {
  const alpha = rgbaToGlyph(data, w, h).data;
  if (solidify) solidifyAlpha(alpha, w, h);

  // ESDT can resolve RGBA directly
  if (subpixel) return glyphToESDT(alpha, data, w, h, pad, radius, cutoff, preprocess, postprocess, debug);

  // EDT color is resolved separately
  const color = rgbaToColor(data, w, h, pad).data;
  const sdf   = glyphToSDF(alpha, w, h, pad, radius, cutoff, false, false, false, false, debug);
  return {...sdf, data: combineRGBA(sdf.data, color)};
}

// Pad color image
export const padRGBA = (data: Uint8Array, w: number, h: number, pad: number = 0): Image => {
  const wp = w + pad * 2;
  const hp = h + pad * 2;
  const out = new Uint8Array(wp * hp * 4);

  let i = 0;
  let j = (pad + pad * wp) * 4;
  for (let y = 0; y < h; ++y) {
    for (let x = 0; x < w; ++x) {
      const r = data[i++];
      const g = data[i++];
      const b = data[i++];
      const a = data[i++];

      out[j++] = r;
      out[j++] = g;
      out[j++] = b;
      out[j++] = a;
    }
    j += pad * 2 * 4;
  };
  return {data: out, width: wp, height: hp};
};

// Convert grayscale glyph to rgba
export const glyphToRGBA = (data: Uint8Array, w: number, h: number, pad: number = 0): Image => {
  const wp = w + pad * 2;
  const hp = h + pad * 2;
  const out = new Uint8Array(wp * hp * 4);

  let i = 0;
  let j = (pad + pad * wp) * 4;
  for (let y = 0; y < h; ++y) {
    for (let x = 0; x < w; ++x) {
      const v = data[i++];

      out[j++] = v;
      out[j++] = v;
      out[j++] = v;
      out[j++] = v;
    }
    j += pad * 2 * 4;
  };
  return {data: out, width: wp, height: hp};
};

// Extract rgb channels as filled out color mask
export const rgbaToColor = (data: Uint8Array, w: number, h: number, pad: number = 0): Image => {
  const wp = w + pad * 2;
  const hp = h + pad * 2;
  const out = new Uint8Array(wp * hp * 4);

  let i = 0;
  let j = (pad + pad * wp) * 4;
  for (let y = 0; y < h; ++y) {
    for (let x = 0; x < w; ++x) {
      const r = data[i++];
      const g = data[i++];
      const b = data[i++];
      const a = data[i++];

      if (a > 0) {
        out[j++] = r;
        out[j++] = g;
        out[j++] = b;
        out[j++] = 255;
      }
      else {
        j += 4;
      }
    }
    j += pad * 2 * 4;
  };

  fill(out, 0, 0, wp, hp, wp);

  return {data: out, width: wp, height: hp};
}

// Extract alpha channel as grayscale glyph
export const rgbaToGlyph = (data: Uint8Array, w: number, h: number, pad: number = 0): Image => {
  const wp = w + pad * 2;
  const hp = h + pad * 2;
  const out = new Uint8Array(wp * hp);

  let i = 0;
  let j = (pad + pad * wp);
  for (let y = 0; y < h; ++y) {
    for (let x = 0; x < w; ++x) {
      const v = data[(i++) * 4 + 3];
      out[j++] = v;
    }
    j += pad * 2;
  };
  return {data: out, width: wp, height: hp};
};

// Combine RGB + SDF
export const combineRGBA = (sdf: Uint8Array, color: Uint8Array): Uint8Array => {
  const out = new Uint8Array(sdf.length);

  const n = sdf.length;
  let j = 0;
  for (let i = 0; i < n;) {
    out[j++] = color[i++];
    out[j++] = color[i++];
    out[j++] = color[i++];
    out[j++] = sdf[i++];
  }

  return out;
}

// Convert SDF to its gradient (for debug)
export const sdfToGradient = (
  data: Uint8Array,
  w: number,
  h: number,
  pad: number = 4,
  radius: number = 3,
): Image => {
  const wp = w + pad * 2;
  const hp = h + pad * 2;
  const np = wp * hp;

  const out = new Uint8Array(np);
  const getData = (x: number, y: number) => (data[4 * (y * wp + x)] ?? 0) / 255 * radius;

  for (let y = 0; y < hp; y++) {
    for (let x = 0; x < wp; x++) {

      const c = getData(x, y);
      const l = getData(x - 1, y);
      const r = getData(x + 1, y);
      const t = getData(x, y - 1);
      const b = getData(x, y + 1);

      const j = y * wp + x;

      const dx = Math.min(Math.abs(c - l), Math.abs(c - r));
      const dy = Math.min(Math.abs(c - t), Math.abs(c - b));
      const dl = Math.sqrt(dx * dx + dy * dy);

      const e = Math.abs(dl - 1);

      out[j] = Math.max(0, Math.min(255, 64 + e * 192));
    }
  }

  return glyphToRGBA(out, wp, hp);
};

// Solidify semi-transparent areas
export const solidifyAlpha = (
  data: Uint8Array | number[],
  w: number,
  h: number,
) => {

  const mask = new Uint8Array(w * h);

  const getData = (x: number, y: number) => (data[y * w + x] ?? 0);
  const getMask = (x: number, y: number) => (mask[y * w + x] ?? 0);

  let masked = 0;

  // Mask pixels whose alpha matches their 4 adjacent neighbors (within 16 steps)
  // and who don't have black or white neighbors.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = x + y * w;

      const a = getData(x, y);
      if (!a || a >= 254) continue;

      const l = getData(x - 1, y);
      const r = getData(x + 1, y);
      const t = getData(x, y - 1);
      const b = getData(x, y + 1);

      const min = Math.min(a, l, r, t, b);
      const max = Math.max(a, l, r, t, b);

      if ((max - min) < 16 && min > 0 && max < 254) {
        // Spread to 4 neighbors with max
        mask[o - 1] = Math.max(mask[o - 1], a);
        mask[o - w] = Math.max(mask[o - w], a);
        mask[o] = a;
        mask[o + 1] = Math.max(mask[o + 1], a);
        mask[o + w] = Math.max(mask[o + w], a);
        masked++;
      }
    }
  }

  if (!masked) return;

  // Sample 3x3 area for alpha normalization factor
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = getData(x, y);
      if (!a || a >= 254) continue;

      const c = getMask(x, y);

      const l = getMask(x - 1, y);
      const r = getMask(x + 1, y);
      const t = getMask(x, y - 1);
      const b = getMask(x, y + 1);

      const tl = getMask(x - 1, y - 1);
      const tr = getMask(x + 1, y - 1);
      const bl = getMask(x - 1, y + 1);
      const br = getMask(x + 1, y + 1);

      const m = c || l || r || t || b || tl || tr || bl || br;
      if (m) data[x + y * w] = Math.min(255, data[x + y * w] / m * 255);
    }
  }
}
