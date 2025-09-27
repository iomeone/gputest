const INF = 1e10;

type SDFStage = {
  outer: Float64Array,
  inner: Float64Array,
  f: Float64Array,
  z: Float64Array,
  v: Uint16Array,
  size: number,
};

const makeSDFStage = (size: number) => {
  const n = size * size;

  const outer = new Float64Array(n);
  const inner = new Float64Array(n);

  const xs = new Float32Array(n);
  const ys = new Float32Array(n);

  const f = new Float64Array(size);
  const z = new Float64Array(size + 1);
  const v = new Uint16Array(size);
  
  return {outer, inner, f, z, v, size};
}

let SDF_STAGE: SDFStage | null = null;

// Pad rectangle by size
export const padRectangle = ([l, t, r, b]: Rectangle, pad: number) => [l - pad, t - pad, r + pad, b + pad];

// Convert grayscale glyph to rgba
export const glyphToRGBA = (data: Uint8Array, w: number, h: number) => {
  const out = new Uint8Array(data.length * 4);
  let n = data.length, j = 0;
  let b = 1;
  let odd = w%2;
  for (let i = 0; i < n; ++i) {
    const v = data[i];

    //b = 1 - b;
    //if (!odd && (i % w) === 0) b = 1 - b;

    out[j++] = b && v;
    out[j++] = b && v;
    out[j++] = b && v;
    out[j++] = b && v;
  };
  return {data: out, width: w, height: h};
};

// Convert grayscale glyph to SDF
export const glyphToSDF = (
  data: Uint8Array,
  w: number,
  h: number,
  pad: number = 4,
  radius: number = 3,
  cutoff: number = 0.25,
) => {
  const wp = w + pad * 2;
  const hp = h + pad * 2;
  const np = wp * hp;
  const sp = Math.max(wp, hp);

  const out = new Uint8Array(np);

  if (!SDF_STAGE || SDF_STAGE.size < sp) {
    SDF_STAGE = makeSDFStage(sp);
  }

  paintIntoStage(SDF_STAGE!, data, w, h, pad);

  const {outer, inner, f, z, v} = SDF_STAGE!;
  edt(outer, 0, 0, wp, hp, wp, f, z, v);
  edt(inner, pad, pad, w, h, wp, f, z, v);

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
) => {
  const wp = w + pad * 2;
  const hp = h + pad * 2;
  const np = wp * hp;

  const {outer, inner, xs, ys} = stage;
  
  outer.fill(INF, 0, np);
  inner.fill(0, 0, np);

  const getData = (x: number, y: number) => (data[y * w + x] ?? 0) / 255;
  
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = getData(x, y);
      if (a === 0) continue;

      const j = (y + pad) * wp + x + pad;

      if (a >= 254/255) {
        outer[j] = 0;
        inner[j] = INF
      } else {
        const d = 0.5 - a;
        const c = a;
        outer[j] = d > 0 ? d * d : 0;
        inner[j] = d < 0 ? d * d : 0;
      }
    }
  }
}

// 2D Euclidean squared distance transform by Felzenszwalb & Huttenlocher https://cs.brown.edu/~pff/papers/dt-final.pdf
const edt = (
  data: Float64Array,
  x0: number,
  y0: number,
  width: number,
  height: number,
  gridWidth: number,
  f: Float64Array,
  z: Float64Array,
  v: Uint16Array,
) => {
  for (let x = x0; x < x0 + width; x++) edt1d(data, y0 * gridWidth + x, gridWidth, height, f, z, v);
  for (let y = y0; y < y0 + height; y++) edt1d(data, y * gridWidth + x0, 1, width, f, z, v);
}

// 1D squared distance transform
const edt1d = (
  grid: Float64Array,
  offset: number,
  stride: number,
  length: number,
  f: Float64Array,
  z: Float64Array,
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
