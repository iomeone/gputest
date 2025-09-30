import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';
import type { Atlas, Tuples, Rectangle } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';
import type { FontMetrics, GlyphMetrics } from '@use-gpu/glyph';
import type { Alignment } from '../types';

import { fence, provide, memo, yeet, useContext, useNoContext, useFiber, useMemo, makeContext, incrementVersion } from '@use-gpu/live';
import { glyphToSDF, rgbaToSDF, padRectangle } from '@use-gpu/glyph';
import { makeAtlas, makeAtlasSource, resizeTextureSource, uploadAtlasMapping, updateMipTextureChain } from '@use-gpu/core';
import { scrambleBits53, mixBits53 } from '@use-gpu/state';

import { getShader } from '../../hooks/useShader';
import { makeInlineCursor } from '../cursor';
import { DebugContext } from '../../providers/debug-provider';
import { DeviceContext } from '../../providers/device-provider';
import { FontContext } from './font-provider';

import { getLODBiasedTexture } from '@use-gpu/wgsl/fragment/lod-bias.wgsl';

export const SDFFontContext = makeContext<SDFFontContextProps>(undefined, 'SDFFontContext');
export const useSDFFontContext = () => useContext(SDFFontContext);
export const useNoSDFFontContext = () => useNoContext(SDFFontContext);

export type SDFFontContextProps = {
  __debug: {
    atlas: Atlas,
  },

  getRadius: () => number,
  getScale: (size: number) => number,
  getGlyph: (font: number, id: number, size: number) => CachedGlyph,
  getTexture: () => ShaderSource,
};

export type SDFFontProviderProps = PropsWithChildren<{
  width?: number,
  height?: number,
  radius?: number,
  pad?: number,
  fence?: (c: LiveElement, then: (t: any) => LiveElement) => LiveElement,
  then?: (atlas: Atlas, source: ShaderSource, gathered: any) => LiveElement
}>;

const NO_MAPPING = [0, 0, 0, 0] as Rectangle;

const roundUp2 = (v: number) => {
  v--;
  v |= v >> 1;
  v |= v >> 2;
  v |= v >> 4;
  v |= v >> 8;
  v |= v >> 16;
  v++;
  return v;
};

const getNearestScale = (size: number) => roundUp2(Math.max(24, size)) * 1.5;

const hashGlyph = (font: number, id: number, size: number) => scrambleBits53(mixBits53(mixBits53(font, id), size * 100));

type CachedGlyph = {
  glyph: GlyphMetrics,
  mapping: [number, number, number, number],
}

export const SDFFontProvider: LiveComponent<SDFFontProviderProps> = memo(({
  width = 256,
  height = 256,
  radius = 16,
  pad = 0,
  fence: op = fence,
  children,
  then,
}: SDFFontProviderProps) => {
  pad += Math.ceil(radius * 0.75);

  const device = useContext(DeviceContext);
  const rustText = useContext(FontContext);

  const {sdf2d: {subpixel, solidify, preprocess, postprocess}} = useContext(DebugContext);

  // Allocate font atlas + backing texture
  const format = "rgba8unorm" as GPUTextureFormat;
  const [glyphs, atlas, source, biasable, biasedSource] = useMemo(() => {
    const glyphs   = new Map<number, CachedGlyph>();
    const atlas    = makeAtlas(width, height);
    const source   = makeAtlasSource(device, atlas, format, 1);
    const biasable = {
      ...source,
      variant: 'textureSampleBias',
      args: ['vec2<f32>', 'f32'],
    };

    // Read-out with LOD bias for sharper SDFs
    const biasedSource = {
      ...getShader(getLODBiasedTexture, [biasable, -0.5]),
      colorSpace: 'srgb',
    };

    source.texture.label = 'Font Atlas';

    return [glyphs, atlas, source, biasable, biasedSource];
  }, [width, height, radius, pad, subpixel, solidify, preprocess, postprocess]);

  const bounds = useMemo(() => makeBoundsTracker());

  // Provide context to map glyphs on-demand
  const context = useMemo(() => {
    if (!rustText) return null;

    const getRadius = () => radius;
    const getScale = (size: number) => size / getNearestScale(size);
    const getTexture = () => biasedSource;

    const getGlyph = (font: number, id: number, size: number): CachedGlyph => {
      const scale = getNearestScale(size);
      const key = hashGlyph(font, id, scale);

      const cache = glyphs.get(key);
      if (cache) return cache;

      // Measure glyph and get image
      const glyph = rustText.measureGlyph(font, id, scale);
      return mapGlyph(key, glyph);
    };

    const mapGlyph = (key: number, glyph: GlyphMetrics) => {
      let mapping: Rectangle = NO_MAPPING;

      const {image, width: w, height: h, outlineBounds: ob, rgba} = glyph;
      if (image && w && h && ob) {

        // Convert to SDF
        const {data, width, height} = (rgba ? rgbaToSDF : glyphToSDF)(image, w, h, pad, radius, undefined, subpixel, solidify, preprocess, postprocess);
        glyph.outlineBounds = padRectangle(ob, pad);
        glyph.image = data;

        try {
          mapping = atlas.place(key, width, height);
          bounds.push(mapping);
        }
        catch (e) {
          mapping = [0, 0, 0, 0];
          console.warn('atlas place failed', key, width, height, e);
          /*
          debugger;
          throw new Error('atlas place failed', key, width, height);
          */
        }

        // If atlas resized, resize the texture backing it
        const [sw, sh] = source.size;
        if (atlas.width !== sw || atlas.height !== sh) {
          const newSource = resizeTextureSource(device, source, atlas.width, atlas.height, 1, 'auto');
          biasable.texture = source.texture = newSource.texture;
          biasable.view    = source.view    = newSource.view;
          biasable.size    = source.size    = newSource.size;

          updateMipTextureChain(device, source, [[0, 0, sw, sh]]);
        }

        uploadAtlasMapping(
          device,
          source.texture,
          format,
          data,
          mapping,
        );
      }

      const entry = {glyph, mapping};
      glyphs.set(key, entry);
      source.version = incrementVersion(source.version);

      return entry;
    };

    return {
      __debug: {
        atlas,
        source,
      },

      getRadius,
      getScale,
      getGlyph,
      getTexture,
    };
  }, [rustText, atlas, source]);

  return rustText ? (
    op(
      provide(SDFFontContext, context, children),
      (gathered: any) => {
        const rects = bounds.flush();
        if (rects.length) updateMipTextureChain(device, source, rects);

        return then ? then(atlas, biasedSource, gathered) : yeet(gathered);
      },
    )
  ) : null;
}, 'SDFFontProvider');

// Lay out glyphs from one or more spans into the given layout box.
//
// Return data buffers with glyph rectangles
export const useSDFGlyphData = (
  layout: Rectangle,
  font: number[],
  spans: Tuples<3>,
  glyphs: Tuples<4>,
  breaks: Uint32Array,
  height: FontMetrics,
  align: Alignment,
  size: number = 48,
  wrap: number = 0,
  snap: boolean = false,
) => {
  const context = useSDFFontContext();
  const {id} = useFiber();

  return useMemo(() => {
    // Final buffers
    const n = glyphs.length;
    const rectangles = new Float32Array(n * 4);
    const uvs = new Float32Array(n * 4);
    const indices = new Uint32Array(n);

    // Custom emitter
    let i = 0;
    let i4 = 0;
    const emit = (
      l1: number,
      t1: number,
      r1: number,
      b1: number,

      l2: number,
      t2: number,
      r2: number,
      b2: number,

      index: number
    ) => {
      rectangles[i4  ] = l1;
      rectangles[i4+1] = t1;
      rectangles[i4+2] = r1;
      rectangles[i4+3] = b1;

      uvs[i4  ] = l2;
      uvs[i4+1] = t2;
      uvs[i4+2] = r2;
      uvs[i4+3] = b2;

      indices[i] = index;

      i4 += 4;
      i++;
    };

    // Push all text spans into layout
    const {ascent, lineHeight} = height;
    const cursor = makeInlineCursor(wrap, align);
    spans.iterate((advance, trim, hard) => cursor.push(advance, trim, hard, lineHeight, 0, 0, 0));

    // Gather lines produced
    const [left, top] = layout;
    const currentLayout: Rectangle = [left, top + ascent, 0, 0];
    let lastIndex = -1;

    const layouts = cursor.gather((start, end, gap, lead, count, _c, _a, _d, _x, index) => {
      if (index !== lastIndex) {
        currentLayout[1] = top + ascent;
        lastIndex = index;
      }

      emitGlyphSpans(context, currentLayout, index, font, spans, glyphs, breaks, start, end, size, gap, lead, snap, emit);
      currentLayout[1] += lineHeight;
    });

    const radius = context.getRadius();
    const scale = context.getScale(size);

    return {
      id,
      indices,
      layouts,
      rectangles,
      uvs,
      sdf: [radius, scale, size, 0] as [number, number, number, number],
    };
  }, [context, layout, spans, glyphs, breaks, height, align, size, wrap, snap]);
}

export const emitGlyphSpans = (
  context: SDFFontContextProps,
  layout: Rectangle,
  currentIndex: number,

  font: number[],
  spans: Tuples<3>,
  glyphs: Tuples<4>,
  breaks: Uint32Array,

  start: number,
  end: number,

  size: number,
  gap: number,
  lead: number,
  snap: boolean,

  emit: (
    l1: number,
    t1: number,
    r1: number,
    b1: number,

    l2: number,
    t2: number,
    r2: number,
    b2: number,

    i: number
  ) => void,
) => {
  const { getGlyph, getScale } = context;
  const [left, top] = layout;

  const scale = getScale(size);

  let x = left + lead;
  const y = top;
  let sx = snap ? Math.round(x) : x;

  spans.iterate((_a, trim, hard, index) => {
    glyphs.iterate((fontIndex: number, id: number, isWhiteSpace: number, kerning: number) => {
      const {glyph, mapping} = getGlyph(font[fontIndex], id, size);
      const {image, layoutBounds, outlineBounds, rgba, scale: glyphScale} = glyph;
      const [,, lr] = layoutBounds;

      const r = rgba ? -1 : 1;
      const s = scale * glyphScale;
      const k = kerning / 65536.0 * scale;
      x += k;
      sx += k;

      if (!isWhiteSpace) {
        if (image && outlineBounds) {
          const [gl, gt, gr, gb] = outlineBounds;

          const cx = snap ? Math.round(sx) : sx;
          const cy = snap ? Math.round(y) : y;

          emit(
            (s * gl) + cx,
            (s * gt) + cy,
            (s * gr) + cx,
            (s * gb) + cy,

            r * mapping[0],
            r * mapping[1],
            r * mapping[2],
            r * mapping[3],

            currentIndex,
          );
        }
      }

      sx += lr * scale;
      x += lr * scale;
    }, breaks[index - 1] || 0, breaks[index]);

    if (hard === 2) {
      currentIndex++;
    }

    if (trim) {
      x += gap;
      sx = snap ? Math.round(x) : x;
    }
  }, start, end);
};

const makeBoundsTracker = () => {
  const rects: Rectangle[] = [];

  const joinRectangles = (a: Rectangle, b: Rectangle): Rectangle => {
    const [al, at, ar, ab] = a;
    const [bl, bt, br, bb] = b;
    return [
      Math.min(al, bl),
      Math.min(at, bt),
      Math.max(ar, br),
      Math.max(ab, bb),
    ] as Rectangle;
  };

  const getArea = ([l, t, r, b]: Rectangle) => Math.abs(r - l) * Math.abs(b - t);

  const push = (rect: Rectangle) => {
    const area = getArea(rect);
    const n = rects.length;

    let max = 0.5;
    let merge = -1;
    let join = null as Rectangle | null;
    for (let i = 0; i < n; ++i) {
      const slot = rects[i];
      const joined = joinRectangles(rect, slot);
      const fit = (area + getArea(slot)) / getArea(joined);
      if (fit > max) {
        max = fit;
        merge = i;
        join = joined;
      }
    }
    if (join) rects.splice(merge, 1, join);
    else rects.push(rect);
  };

  const flush = () => {
    const rs = rects.slice();
    rects.length = 0;
    return rs;
  };

  return {push, flush};
};
