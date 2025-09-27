import type { Image } from './types';
import { glyphToRGBA, INF, Rectangle, SDFStage, getSDFStage } from './sdf';

// Convert grayscale glyph to SDF using pixel-based distance transform
export const glyphToEDT = (
  data: Uint8Array,
  w: number,
  h: number,
  pad: number = 4,
  radius: number = 3,
  cutoff: number = 0.25,
  debug?: (image: Image) => void,
) => {
  const wp = w + pad * 2;
  const hp = h + pad * 2;
  const np = wp * hp;
  const sp = Math.max(wp, hp);

  const out = new Uint8Array(np);

  const stage = getSDFStage(sp);
  paintIntoStage(stage, data, w, h, pad);

  const {outer, inner, f, z, v} = stage;
  if (debug) {
    const sdfToDebugView = makeSDFToDebugView(wp, hp, np, radius, cutoff);
    debug(sdfToDebugView(outer, inner, true));

    edt(outer, 0, 0, wp, hp, wp, f, z, v, 1);
    debug(sdfToDebugView(outer, null));
    edt(outer, 0, 0, wp, hp, wp, f, z, v, 2);
    debug(sdfToDebugView(outer, null));

    edt(inner, pad, pad, w, h, wp, f, z, v, 1);
    debug(sdfToDebugView(null, inner));
    edt(inner, pad, pad, w, h, wp, f, z, v, 2);
    debug(sdfToDebugView(null, inner));

    debug(sdfToDebugView(outer, inner));
  }
  else {
    edt(outer, 0, 0, wp, hp, wp, f, z, v);
    edt(inner, pad, pad, w, h, wp, f, z, v);
  }

  for (let i = 0; i < np; i++) {
    const d = Math.sqrt(outer[i]) - Math.sqrt(inner[i]);
    out[i] = Math.max(0, Math.min(255, Math.round(255 - 255 * (d / radius + cutoff))));
  } 

  return glyphToRGBA(out, wp, hp);
};

// Paint glyph data into stage
export const paintIntoStage = (
  stage: SDFStage,
  data: Uint8Array | number[],
  w: number,
  h: number,
  pad: number,
  subpixel?: boolean,
) => {
  const wp = w + pad * 2;
  const hp = h + pad * 2;
  const np = wp * hp;

  const {outer, inner} = stage;
  
  outer.fill(INF, 0, np);
  inner.fill(0, 0, np);

  const getData = (x: number, y: number) => (data[y * w + x] ?? 0) / 255;
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = getData(x, y);
      const i = (y + pad) * wp + x + pad;

      if (a >= 254/255) {
        // Fix for bad rasterizer rounding
        data[y * w + x] = 255;

        outer[i] = 0;
        inner[i] = INF
      }
      else if (a > 0) {
        const d = 0.5 - a;
        outer[i] = d > 0 ? d*d : 0;
        inner[i] = d < 0 ? d*d : 0;
      }
    }
  }
}

const makeSDFToDebugView = (
  wp: number,
  hp: number,
  np: number,
  radius: number,
  cutoff: number,
) => (
  outer: any | null,
  inner: any | null,
  mask: boolean = false,
): Image => {
  
  const out: number[] = [];
  for (let i = 0; i < np; i++) {
    const d = mask ? 0 : (outer ? Math.sqrt(outer[i]) : 0) - (inner ? Math.sqrt(inner[i]) : 0);
    out[i] = Math.max(0, Math.min(255, Math.round(255 - 255 * (d / radius + cutoff))));
  }

  const rgba = glyphToRGBA(new Uint8Array(out), wp, hp);
  
  if (mask) {
    if (outer) for (let i = 0; i < np; ++i) {
      if (outer[i] != INF) {
        rgba.data[i * 4 + 0] *= 0.25;
        rgba.data[i * 4 + 1] *= 0.65;
        rgba.data[i * 4 + 2] *= 0.90;
      }
    }
    if (inner) for (let i = 0; i < np; ++i) {
      if (inner[i] != INF) {
        rgba.data[i * 4 + 0] *= 0.35;
        rgba.data[i * 4 + 1] *= 0.95;
        rgba.data[i * 4 + 2] *= 0.9;
      }
    }
  }
  else {
    if (outer) for (let i = 0; i < np; ++i) {
      if (outer[i]) {
        rgba.data[i * 4 + 0] *= 0.35;
        rgba.data[i * 4 + 1] *= 0.95;
        rgba.data[i * 4 + 2] *= 0.9;
      }
    }
    if (inner) for (let i = 0; i < np; ++i) {
      if (inner[i]) {
        rgba.data[i * 4 + 0] *= 0.25;
        rgba.data[i * 4 + 1] *= 0.65;
        rgba.data[i * 4 + 2] *= 0.90;
      }
    }
  }

  return rgba;
}

// 2D Euclidean squared distance transform by Felzenszwalb & Huttenlocher https://cs.brown.edu/~pff/papers/dt-final.pdf
export const edt = (
  data: Float32Array,
  x0: number,
  y0: number,
  width: number,
  height: number,
  gridWidth: number,
  f: Float32Array,
  z: Float32Array,
  v: Uint16Array,
  half?: number,
) => {
  if (half !== 2) for (let y = y0; y < y0 + height; y++) edt1d(data, y * gridWidth + x0, 1, width, f, z, v);
  if (half !== 1) for (let x = x0; x < x0 + width; x++) edt1d(data, y0 * gridWidth + x, gridWidth, height, f, z, v);
}

// 1D squared distance transform
export const edt1d = (
  grid: Float32Array,
  offset: number,
  stride: number,
  length: number,
  f: Float32Array,
  z: Float32Array,
  v: Uint16Array,
) => {
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  f[0] = grid[offset];

  for (let q = 1, k = 0, s = 0; q < length; q++) {
    f[q] = grid[offset + q * stride];

    const q2 = q * q;
    do {
      const r = v[k];
      s = (f[q] - f[r] + q2 - r * r) / (q - r) / 2;
    } while (s <= z[k] && --k > -1);

    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }

  for (let q = 0, k = 0; q < length; q++) {
    while (z[k + 1] < q) k++;
    const r = v[k];
    const qr = q - r;
    const fr = f[r];
    grid[offset + q * stride] = fr + qr * qr;
  }
}
