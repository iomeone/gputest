import { toFloat16 } from '@use-gpu/core';

// Based on:
// http://www.graphics.cornell.edu/~bjw/rgbe/rgbe.c
const HDR_MAGIC = 0x3F23;

type Pointer = {offset: number};

export const parseHDR = (
  data: ArrayBuffer,
): any => {
  const view = new DataView(data);
  const ptr = {offset: 0};

  const magic = getUint16(view, ptr);
  if (magic != HDR_MAGIC) throw new Error(`Invalid HDR header 0x${magic.toString(16)}`);

  const meta = {
    size: [0, 0],
    format: '',
    gamma: 1,
    exposure: 1,
  };

  while (ptr.offset < 512) {
    const line = getLine(view, ptr);
    const [key, value] = line.split('=');
    if (key === 'GAMMA') meta.gamma = +value;
    if (key === 'EXPOSURE') meta.exposure = +value;
    if (key === 'FORMAT') { meta.format = value; }
    if (key.match(/^-Y /)) {
      const [,y,,x] = line.split(/ /g);
      meta.size = [+x, +y];
      break;
    }
  }

  if (ptr.offset >= 512) throw new Error(`End of HDR header not found`);
  if (meta.format !== '32-bit_rle_rgbe') throw new Error(`Unsupported HDR format '${meta.format ?? 'null'}'`);

  const rgba16 = readPixels(view, ptr, meta.size[0], meta.size[1]);

  return {
    size: meta.size,
    data: rgba16,
    format: 'rgba16float',
  };
};

const readPixels = (view: DataView, ptr: Pointer, width: number, height: number) => {
  const out = new Uint16Array(width * height * 4);
  if ((width < 8) || (width > 0x7fff)) return readPixelsRaw(view, ptr, width * height, out);
  return readPixelsRLE(view, ptr, width, height, out);
};

const readPixelsRaw = (view: DataView, ptr: Pointer, count: number, out: Uint16Array) => {
  for (let i = 0, j = 0; i < count; ++i, j += 4) {
    const r = getUint8(view, ptr);
    const g = getUint8(view, ptr);
    const b = getUint8(view, ptr);
    const e = getUint8(view, ptr);

		const scale = Math.pow(2, e - 128) / 255;

    out[j + 0] = toFloat16(Math.min(r * scale, 65504));
    out[j + 1] = toFloat16(Math.min(g * scale, 65504));
    out[j + 2] = toFloat16(Math.min(b * scale, 65504));
    out[j + 3] = toFloat16(1.0);
  }
  return out;
};

const readPixelsRLE = (view: DataView, ptr: Pointer, width: number, height: number, out: Uint16Array) => {
  const count = width * height;

  let y = 0;
  let scanlines = height;
  while (scanlines > 0) {
    const a = getUint8(view, ptr);
    const b = getUint8(view, ptr);
    const c = getUint8(view, ptr);
    const d = getUint8(view, ptr);

    if (a !== 2 || b !== 2 || (c & 0x80)) throw new Error("HDR RLE data missing");
    if (((c << 8) | d) != width) throw new Error("HDR scanline length mismatch");

    for (let i = 0; i < 4; ++i) {
      const end = (y + 1) * width * 4 + i;
      let o = y * width * 4 + i;
      while (o < end) {
        const count = getUint8(view, ptr);
        if (count > 128) {
          const value = getUint8(view, ptr);
          let repeat = count - 128;
          if (repeat > (end - o) / 4) throw new Error("HDR scanline repeat mismatch");

          while (repeat--) { out[o] = value; o += 4; }
        }
        else {
          if (count > (end - o) / 4) throw new Error("HDR scanline repeat mismatch");
          for (let j = 0; j < count; ++j) { out[o] = getUint8(view, ptr); o += 4; }
        }
      }
    }

    y++;
    scanlines--;
  }

  for (let i = 0, j = 0; i < count; ++i, j += 4) {
    const r = out[j];
    const g = out[j + 1];
    const b = out[j + 2];
    const e = out[j + 3];

		const scale = Math.pow(2, e - 128) / 255;
    out[j    ] = toFloat16(Math.min(r * scale, 65504));
    out[j + 1] = toFloat16(Math.min(g * scale, 65504));
    out[j + 2] = toFloat16(Math.min(b * scale, 65504));
    out[j + 3] = toFloat16(1.0);
  }

  return out;
};


///////////////////////////////////////////////////////////////////////////////
// Binary parsers
///////////////////////////////////////////////////////////////////////////////

export const getUint8 = (view: DataView, ptr: Pointer): number =>
  view.getUint8(ptr.offset++);

export const getUint16 = (view: DataView, ptr: Pointer): number => {
  const int = view.getUint16(ptr.offset, true);
  ptr.offset += 2;
  return int;
};

export const getLine = (view: DataView, ptr: Pointer): string => {
  const chars = [];
  for (let i = 0; i < 256; ++i) {
    const c = getUint8(view, ptr);
    if (!c || c === 10) break;
    chars.push(c);
  }
  return String.fromCharCode(...chars);
};
