import { makeTextureDataLayout, makeDynamicTexture, makeTextureView, uploadTexture } from './texture';
import { Atlas, TextureSource } from './types';
import uniq from 'lodash/uniq';

type Rectangle = [number, number, number, number];
type Point = [number, number];

type Slot = [number, number, number, number, number, number, number, number, number];
type Bin = Set<Slot>;
type Bins = Map<number, Set<Slot>>;

const EMPTY: any[] = [];
const sqr = (x: number) => x * x;
const lerp = (a: number, b: number, t: number) => a * t + b * (1 - t);
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

export const makeAtlasSource = (
  device: GPUDevice,
  atlas: Atlas,
  format: GPUTextureFormat,
): TextureSource => {
  const texture = makeDynamicTexture(device, atlas.width, atlas.height, 1, format);
  const source = {
    texture,
    view: makeTextureView(texture),
    sampler: {
      minFilter: 'linear',
      magFilter: 'linear',
    } as GPUSamplerDescriptor,
    layout: 'texture_2d<f32>',
    absolute: true,
    format,
    size: [atlas.width, atlas.height] as [number, number],
    version: 1,
  };
  return source;
}

export const makeAtlas = (
  width: number,
  height: number,
  maxWidth: number = 4096,
  maxHeight: number = 4096,
  snap: number = 1,
) => {
  
  const ls: Bins = new Map();
  const rs: Bins = new Map();
  const ts: Bins = new Map();
  const bs: Bins = new Map();
  const slots: Bin = new Set();

  const place = (key: number, w: number, h: number): Rectangle => {
    if (map.get(key)) throw new Error("key mapped already: " + key);
    self.version = self.version + 1;

    const cw = Math.ceil(w / snap) * snap;
    const ch = Math.ceil(h / snap) * snap;

    const slot = getNextAvailable(cw, ch, true);
    if (!slot) {
      expand();
      return place(key, w, h);
    }

    const [x, y] = slot;
    const rect = [x, y, x + w, y + h] as Rectangle;

    if (snap) {
      const clip = [x, y, x + cw, y + ch] as Rectangle;
      clipRectangle(clip);
    }
    else clipRectangle(rect);
    map.set(key, rect);
    return rect;
  };
  
  const expand = () => {
    const w = width * 2;
    const h = height * 2;
    
    if (w > maxWidth || h > maxHeight) {
      throw new Error(`Atlas is full and can't expand any more (${maxWidth}x${maxHeight})`);
    }

    const slot = [0, 0, w, h, w, h, w, h, 1] as Slot;
    const splits = subtractSlot(slot, [0, 0, width, height] as Rectangle);
    for (const s of splits) addSlot(s);

    const r = rs.get(width);
    const b = bs.get(height);
    const expandX = r ? Array.from(r.values()) : EMPTY;
    const expandY = b ? Array.from(b.values()) : EMPTY;
    const expand = uniq([...expandX, ...expandY]);

    for (const s of expand) removeSlot(s);
    for (const s of expand) {
      let [l, t, r, b, nearX, nearY, farX, farY, corner] = s;
      if (r === width) r = w;
      if (b === height) b = h;
      addSlot([l, t, r, b, nearX, nearY, farX, farY, corner]);
    }

    self.width = width = w;
    self.height = height = h;
  };

  const getBin = (xs: Bins, x: number) => {
    let vs = xs.get(x);
    if (!vs) xs.set(x, vs = new Set<Slot>());
    return vs;
  }

  const addSlot = (slot: Slot) => {
    const [l, t, r, b] = slot;

    {
      const lsb = ls.get(l);
      const rsb = rs.get(r);
      const tsb = ts.get(t);
      const bsb = bs.get(b);

      const remove: Slot[] = [] ;
      if (lsb) for (const s of lsb) {
        if (containsRectangle(s, slot)) return;
        if (containsRectangle(slot, s)) remove.push(s);
      }
      if (rsb) for (const s of rsb) {
        if (containsRectangle(s, slot)) return;
        if (containsRectangle(slot, s)) remove.push(s);
      }
      if (tsb) for (const s of tsb) {
        if (containsRectangle(s, slot)) return;
        if (containsRectangle(slot, s)) remove.push(s);
      }
      if (bsb) for (const s of bsb) {
        if (containsRectangle(s, slot)) return;
        if (containsRectangle(slot, s)) remove.push(s);
      }
    
      for (const s of remove) removeSlot(s);
    }

    {
      const lsb = getBin(ls, l);
      const rsb = getBin(rs, r);
      const tsb = getBin(ts, t);
      const bsb = getBin(bs, b);

      slots.add(slot);
      lsb.add(slot);
      rsb.add(slot);
      tsb.add(slot);
      bsb.add(slot);
    }
  };

  const removeSlot = (slot: Slot) => {
    const [l, t, r, b] = slot;

    const lsb = getBin(ls, l);
    const rsb = getBin(rs, r);
    const tsb = getBin(ts, t);
    const bsb = getBin(bs, b);
    
    slots.delete(slot);
    lsb.delete(slot);
    rsb.delete(slot);
    tsb.delete(slot);
    bsb.delete(slot);

    if (lsb.size === 0) ls.delete(l);
    if (rsb.size === 0) rs.delete(r);
    if (tsb.size === 0) ts.delete(t);
    if (bsb.size === 0) bs.delete(b);
  };
  
  const map = new Map<number, Rectangle>();
  
  const slotFit = (x: number, near: number, far: number, full: number) => {
    
    // Must not exceed near, unless already close to full
    const f1 = x <= near ? x / near : x / full;

    // Must not exceed far, with penalty for overhang, unless far is close to full
    const f2 = lerp(x <= far ? x / far : 0.5 + (x - far) / (full - far) / 2, 1.0, far / full);

    return f1 * f2;
  };

  const getNextAvailable = (w: number, h: number, debug: boolean = false) => {
    let slot: Slot | null = null;
    let max = 0;

    for (const s of slots.values()) {
      const [l, t, r, b, nearX, nearY, farX, farY, corner] = s;
      
      const x = l;
      const y = t;
      const cw = r - l;
      const ch = b - t;

      if (w <= cw && h <= ch) {
        const fx = slotFit(w, nearX, farX, cw);
        const fy = slotFit(h, nearY, farY, ch);

        const f = 1.0 - (Math.min(x / width, y / height) + (x / width * y / height)) * .25;

        const b = corner + 1;
        const d = b * f * fx * fy;

        if (d > max) {
          slot = s;
          max = d;
        }
      }
    }

    return slot;
  }
  
  const stats = {
    slots: 0,
    checks: 0,
    clips: 0,
  };
  
  const clipRectangle = (other: Rectangle) => {
    const add = [] as Slot[];
    const remove = [] as Slot[];

    const [l, t, r, b] = other;
    const w = r - l;
    const h = b - t;

    for (const slot of slots.values()) {
      stats.checks++;
      if (intersectRectangle(slot, other)) {
        const splits = subtractSlot(slot, other);
        add.push(...splits);
        remove.push(slot);

        stats.slots += splits.length;
        stats.clips++;
      }
    };
    
    for (const s of remove) removeSlot(s);
    for (const s of add) addSlot(s);
  };

  const debugPlacements = () => Array.from(map.keys()).map(k => map.get(k)!);
  const debugSlots = () => Array.from(slots.values()).map(s => s);

  const debugValidate = () => {
    const rects = debugPlacements();
    let n = rects.length;
    
    const out: any[] = [];
    
    const box: Rectangle = [Infinity, Infinity, -Infinity, -Infinity];

    for (let i = 0; i < n; ++i) {
      const a = rects[i];
      const [l, t, r, b] = a;

      box[0] = Math.min(box[0], l);
      box[1] = Math.min(box[1], t);
      box[2] = Math.max(box[2], r);
      box[3] = Math.max(box[3], b);

      for (let j = i + 1; j < n; ++j) {
        const b = rects[j];

        if (!(a[0] >= b[2] || b[0] >= a[2] || a[1] >= b[3] || b[1] >= a[3])) {
          console.warn(`Overlap detected ${a.join(',')} => ${b.join(',')}`);
          const pl = Math.max(a[0], b[0]);
          const pt = Math.max(a[1], b[1]);
          const pr = Math.min(a[2], b[2]);
          const pb = Math.min(a[3], b[3]);
          const dx = pr - pl;
          const dy = pb - pt;
          out.push({x: pl, y: pt, dx, dy});
        }
      }
    }

    return out;
  }

  const slot = [0, 0, width, height, width, height, width, height, 1] as Slot;
  addSlot(slot);

  const self = {
    place, map, expand,
    width, height, version: 0,
    debugPlacements, debugSlots, debugValidate,
  } as Atlas;

  return self;
};

export const uploadAtlasMapping = (
  device: GPUDevice,
  texture: GPUTexture,
  format: GPUTextureFormat,
  data: Uint8Array,
  rect: Rectangle,
): void => {
  const [l, t, r, b] = rect;

  const offset = [l, t] as Point;
  const size = [r - l, b - t] as Point;
    
  const layout = makeTextureDataLayout(size, format);  
  uploadTexture(device, texture, data, layout, size, offset);
}

const intersectRange = (minA: number, maxA: number, minB: number, maxB: number) => !(minA >= maxB || minB >= maxA);
const intersectRangeEnds = (minA: number, maxA: number, minB: number, maxB: number) => !(minA > maxB || minB > maxA);
const containsRange = (minA: number, maxA: number, minB: number, maxB: number) => (minA <= minB && maxA >= maxB);
const getOverlap = (minA: number, maxA: number, minB: number, maxB: number) => Math.max(0, Math.min(maxA, maxB) - Math.max(minA, minB));

type RectLike = Rectangle | Slot;

const containsRectangle = (a: RectLike, b: RectLike): boolean => {
  const [al, at, ar, ab] = a;
  const [bl, bt, br, bb] = b;

  return containsRange(al, ar, bl, br) && containsRange(at, ab, bt, bb);
};

const touchRectangle = (a: RectLike, b: RectLike): boolean => {
  const [al, at, ar, ab] = a;
  const [bl, bt, br, bb] = b;

  return intersectRangeEnds(al, ar, bl, br) && intersectRangeEnds(at, ab, bt, bb);
};

const intersectRectangle = (a: RectLike, b: RectLike): boolean => {
  const [al, at, ar, ab] = a;
  const [bl, bt, br, bb] = b;

  return intersectRange(al, ar, bl, br) && intersectRange(at, ab, bt, bb);
};

const subtractSlot = (a: Slot, b: RectLike): Slot[] => {
  const [al, at, ar, ab, nearX, nearY, farX, farY, corner] = a;
  const [bl, bt, br, bb] = b;
  
  const out: Slot[] = [];

  const push = (l: number, t: number, r: number, b: number, nx: number, ny: number, fx: number, fy: number, corner: number) => {
    const w = r - l;
    const h = b - t;

    nx = clamp(nx, 0, w) || w;
    ny = clamp(ny, 0, h) || h;
    fx = clamp(fx, 0, w) || w;
    fy = clamp(fy, 0, h) || h;

    out.push([
      l, t, r, b,
      clamp(nx, 0, w),
      clamp(ny, 0, h),
      clamp(fx, 0, w),
      clamp(fy, 0, h),
      corner,
    ]);
  };

  if (al < bl) {
    const nx = at < bt ? nearX : Math.min(nearX, bl - al);
    const fx = ab > bb ? farX : Math.min(farX, bl - al);
    const ny = nearY;
    const fy = at < bt ? 0 : at - bt;

    push(al, at, bl, ab, nx, ny, fx, fy, 1);
  }
  if (at < bt) {
    const ny = al < bl ? nearY : Math.min(nearY, bt - at);
    const fy = ar > br ? farY : Math.min(farY, bt - at);
    const nx = nearX;
    const fx = al < bl ? 0 : al - br;
    push(al, at, ar, bt, nx, ny, fx, fy, 1);
  }
  if (ar > br) {
    const nx = nearX - (br - al);
    const fx = farX - (br - al);
    const ny = at < bt ? ab - at : bb - at;
    const fy = farY;
    push(br, at, ar, ab, nx, ny, fx, fy, +((at >= bt) || (at === 0)));
  }
  if (ab > bb) {
    const ny = nearY - (bb - at);
    const fy = farY - (bb - at);
    const nx = al < br ? ar - al : br - al;
    const fx = farX;
    push(al, bb, ar, ab, nx, ny, fx, fy, +((al >= bl) || (al === 0)));
  }

  return out;
};
