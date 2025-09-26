type Rectangle = [number, number, number, number];
type Caret = [number, number];
type Anchor = {
  x: number,
  y: number,
  dx: number,
  dy: number,
  shadow: [number, number] | null,
  caret: Caret | null,
};

const NEW_CARET: Caret = [-1, -1];
const SPLIT_X: Caret = [1, 0];
const SPLIT_Y: Caret = [0, 1];

const makeAnchor = (
  x: number,
  y: number,
  dx: number,
  dy: number,
  caret: Caret | null = null,
  shadow: null,
) => ({x, y, dx, dy, shadow, caret});

export type AtlasMapping = {
  rect: Rectangle,
  uv: Rectangle,
};

enum Overlap {
  none = 'none',
  some = 'some',
}

const getRangeOverlap = (minA: number, maxA: number, minB: number, maxB: number) => {
  if (maxA <= minB || maxB <= minA) return Overlap.none;
  return Overlap.some;
};

export const makeAtlas = (
  width: number,
  height: number,
) => {
  let anchors = [] as Anchor[];
  let lengths = [] as Caret[];

  const map = new Map<number, AtlasMapping>();

  let lastR = 0;
  let lastB = 0;

  const getNextAvailable = (w: number, h: number, debug: boolean = false) => {
    let n = anchors.length;

    let anchor: Anchor | null = null;
    let index = -1;
    let max = 0;

    for (let i = 0; i < n; ++i) {
      const a = anchors[i];
      const {x, y, dx, dy, shadow, caret} = a;
      if (!caret) continue;

      const [cw, ch] = caret;
      if (w <= cw && h <= ch) {
        const fx = (w <= dx ? w / dx : w / ch);
        const fy = (h <= dy ? h / dy : w / cw);

        const s = x === lastR || y === lastB ? 1.0 : 0.5;
        const f = 1.0 - (Math.min(x / width, y / height) + (x / width * y / height)) * .25;
        const d = s * f * fx * fy;
                  if (debug) console.log({s, f, d})
        if (d > max) {
          anchor = a;
          index = i;
          max = d;
        }
      }
    }

    return {anchor, index};
  }
 
  const resolveCarets = (anchors: Anchors[]) => {
    for (let a of anchors) {
      if (a.caret === NEW_CARET) {
        a.caret = clipCaretToAnchors(a.x, a.y, anchors);
      }
    }
  };
  
  const clipCaretToAnchors = (
    l: number,
    t: number,
    anchors: Anchor[],
    caret?: [number. number] | null,
  ) => {
    const c = caret ?? [width - l, height - t] as Caret;
    let [w, h] = c;

    if (l === 210 && t === 700) console.log('@clip', l, t);

    for (const anchor of anchors) {
      const {x, y, dx, dy} = anchor;

      const xo = dy < 0 ? getRangeOverlap(l, l + w, x, x + 1) : Overlap.none;
      if (l === 210 && t === 700) console.log('clip X at', x, y, '@', xo);
      if (xo === Overlap.some) {
        const yo = getRangeOverlap(t, t + h, Math.min(y, y + dy), Math.max(y, y + dy));
        if (l === 210 && t === 700) console.log('clip Y to', x, y, '@', yo);
        if (yo !== Overlap.none) {
          w = Math.min(w, x - l);
        }
      }

      const yo = dx < 0 ? getRangeOverlap(t, t + h, y, y + 1) : Overlap.none;
      if (l === 210 && t === 700) console.log('clip Y at', x, y, '@', yo);
      if (yo === Overlap.some) {
        const xo = getRangeOverlap(l, l + w, Math.min(x, x + dx), Math.max(x, x + dx));
        if (l === 210 && t === 700) console.log('clip X to', x, y, '@', xo, yo);
        if (xo !== Overlap.none) {
          h = Math.min(h, y - t);
        }
      }
    }
    
    if (w <= 0 || h <= 0) return null;

    c[0] = w;
    c[1] = h;
    return c;
  };
  
  const insertAnchors = (anchors: Anchor[], index: number, rect: Rectangle) => {
    const [l, t, r, b] = rect;
    const w = r - l;
    const h = b - t;

    const n = anchors.length;
    const oldAnchor = anchors[index];

    const prevAnchor = anchors[index - 1];
    const nextAnchor = anchors[index + 1];

    const {x, y, dx, dy, shadow} = oldAnchor;
    console.log('place', x, y, dx, dy, 'at', rect[0], rect[1], shadow)

    const ca = (dy != h || shadow === SPLIT_X) ? makeAnchor(l, b, w, dy - h, true ? NEW_CARET : null) : null;
    const cb = makeAnchor(r, b, 0, 0);
    const cc = (dx != w || shadow === SPLIT_Y) ? makeAnchor(r, t, dx - w, h, true ? NEW_CARET : null) : null;

    const newAnchors = [] as Anchor[];
    if (shadow && shadow[0]) {
      newAnchors.push({...oldAnchor, dy: 0, caret: null, shadow: null });
      if (ca) ca.dy = -h;
    }
    if (ca) newAnchors.push(ca);
    newAnchors.push(cb);
    if (cc) newAnchors.push(cc);
    console.log({newAnchors})
    if (shadow && shadow[1]) {
      newAnchors.push({...oldAnchor, dx: 0, caret: null, shadow: null });
      if (cc) cc.dx = -w;
    }

    let out = [] as Anchor[];
    let measure: number[] = [];
    for (let a of anchors) {
      let {x, y, dx, dy, shadow, caret} = a;

      if (a === oldAnchor) {
        measure.push(out.length - 1);
        measure.push(out.length);
        measure.push(out.length + 1);
        out.push(...newAnchors);
        measure.push(out.length - 1);
        measure.push(out.length);
        measure.push(out.length + 1);
        continue;
      }
      else if (a === prevAnchor) {
        if (!ca && shadow !== SPLIT_Y) continue;
        a.shadow = undefined;
      }
      else if (a === nextAnchor) {
        if (!cc && shadow !== SPLIT_X) continue;
        a.shadow = undefined;
      }

      if (caret) {
        const [cw, ch] = caret;
        if (x >= r || x + cw <= l || y >= b || y + ch <= t) {
          out.push(a);
        }
        else {
          a.caret = clipCaretToAnchors(x, y, newAnchors, caret);
          out.push(a);
        }
      }
      else {
        out.push(a);
      }
    }
    
    console.log('->', out.slice())
    
    const measureAnchor = (anchors: number[], index: number) => {
      const a = anchors[index];
      const prev = anchors[index - 1];
      const next = anchors[index + 1];
      
      if (!prev || !next) return;

      let pdy = -(a.y - prev.y);
      let ndx = next.x - a.x;

      let dx = ndx;
      let dy = pdy;

      if (dx === 0 && a.caret) dx = a.caret[0];
      if (dy === 0 && a.caret) dy = a.caret[1];

      a.dx = dx;
      a.dy = dy;
    };

    const fixUp = (anchors: Anchor[]) => {
      let n = anchors.length;

      let out: Anchor[] = [];
      let measure: number[] = [];
      console.log('fixUp', anchors);

      for (let i = 0; i < n; ++i) {
        const a = anchors[i];
        const prev = anchors[i - 1];
        const next = anchors[i + 1];

        if (!prev || !next) {
          out.push(a);
          continue;
        }

        const dx = a.x - prev.x;
        const dy = -(a.y - prev.y);
        if (dx === 0 && dy === 0) {
          out[out.length - 1].shadow = undefined;
          measure.push(out.length - 1);
          measure.push(out.length);
          continue;
        }

        const mdx = (next.x - a.x) * dx;
        const mdy = (next.y - a.y) * -dy;
        if ((mdx < 0 && !mdy) || (mdy < 0 && !mdx)) {
          measure.push(out.length - 1);
          measure.push(out.length);
          console.log({mdx, mdy})
          continue;
        }

        out.push(a);
      }

      for (let i of measure) {
        measureAnchor(out, i - 1);
        measureAnchor(out, i);
      }

      if (out.length !== anchors.length) return fixUp(out);
      return out;
    };

    const castSplit = (anchors: Anchor[]) => {
      if (dy < h) {
        let min = Infinity;
        let split = -1;
        let at = 0;

        let n = anchors.length - 1;
        for (let i = 0; i < n; ++i) {
          const pa = anchors[i];
          const pb = anchors[i + 1];
        
          if (pa.x === pb.x && pa.x < l) {
            if (pa.y >= b && pb.y < b) {
              const d = l - pa.x;
              if (d < 0 || d >= min) continue;
              min = d;
              split = i;
              at = pa.x;
            }
          }
        }

        if (split >= 0) {
          const a = makeAnchor(at, b, 0, 0, NEW_CARET, SPLIT_Y);
          a.caret = clipCaretToAnchors(at, b, anchors);
          anchors.splice(split + 1, 0, a);

          measureAnchor(anchors, split + 1);
        }
      }

      if (dx < w) {
        let min = Infinity;
        let split = -1;
        let at = 0;

        let n = anchors.length - 1;
        for (let i = 0; i < n; ++i) {
          const pa = anchors[i];
          const pb = anchors[i + 1];

          if (pa.y === pb.y && pa.y < t) {
            if (pb.x >= r && pa.x < r) {
              const d = t - pa.y;
              if (d < 0 || d >= min) continue;
              min = d;
              split = i;
              at = pa.y;
            }
          }
        }

        if (split >= 0) {
          const a = makeAnchor(r, at, 0, 0, NEW_CARET, SPLIT_X);
          a.caret = clipCaretToAnchors(r, at, anchors);
          anchors.splice(split + 1, 0, a);

          measureAnchor(anchors, split + 1);
        }
      }
    };

    castSplit(out);
    resolveCarets(out);

    for (const i of measure) {
      measureAnchor(out, i - 1);
      measureAnchor(out, i);
    }
    
    return fixUp(out);
  };

  const place = (key: number, w: number, h: number) => {
    console.log('-----')
    if (map.get(key)) throw new Error("key mapped already", key);

    const {anchor, index} = getNextAvailable(w, h);
    if (index < 0) {
      console.warn('atlas full?', index);
      getNextAvailable(w, h, true);
      return null;
    }

    const {x, y} = anchor;
    const rect = [x, y, x + w, y + h];
    const uv = [rect[0] / width, rect[1] / height, rect[2] / width, rect[2] / height];

    lastR = x + w;
    lastB = y + h;

    anchors = insertAnchors(anchors, index, rect);
    console.log({anchors})
    console.log({rect})

    const placement = {rect, uv};
    map.set(key, placement);
    return placement;
  };

  const debugAnchors = () => anchors;
  const debugPlacements = () => Array.from(map.keys()).map(k => map.get(k)!);
  
  const debugValidate = () => {
    const rects = debugPlacements().map(({rect}) => rect);
    
    const out: Caret[] = [];

    let n = rects.length;
    for (let i = 0; i < n; ++i) {
      const a = rects[i];
      for (let j = i + 1; j < n; ++j) {
        const b = rects[j];
        if (!(a[0] >= b[2] || b[0] >= a[2] || a[1] >= b[3] || b[1] >= a[3])) {
          console.warn(`Overlap detected ${a.join(',')} => ${b.join(',')}`);
          const x = Math.max(a[0], b[0]);
          const y = Math.max(a[1], b[1]);
          const dx = Math.min(a[2], b[2]) - x;
          const dy = Math.min(a[3], b[3]) - y;
          out.push({x, y, dx, dy});
        }
      }
    }

    return out;
  }

  anchors.push(makeAnchor(0, height, 0, height));
  anchors.push(makeAnchor(0, 0, width, height, [width, height]));
  anchors.push(makeAnchor(width, 0, width, 0));

  return {place, map, width, height, debugAnchors, debugPlacements, debugValidate};
};
