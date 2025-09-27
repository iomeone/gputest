import type { LiveComponent } from '@use-gpu/live';
import type { TextureSource, Tuples, Point4 } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import type { FontMetrics } from '@use-gpu/glyph';
import type { InlineLine } from '../types';

import { use, yeet, useContext, useMemo } from '@use-gpu/live';
import { SDFFontProvider, useSDFFontContext, SDF_FONT_ATLAS } from '@use-gpu/workbench';
import { evaluateDimension } from '../parse';

const BLACK = [0, 0, 0, 1];

export type GlyphsProps = {
  id: number,

  color?: Point4,
  opacity?: number,
  size?: number,
  detail?: number,
  expand?: number,
  snap?: boolean,

  font: number[],
  spans: Tuples<3>,
  glyphs: Tuples<2>,
  breaks: Uint32Array,
  height: FontMetrics,
  lines: InlineLine[],
  
  clip?: ShaderModule,
  transform?: ShaderModule,
};

export const Glyphs: LiveComponent<GlyphsProps> = (props) => {
  const {
    id,
    color = BLACK,
    opacity = 1,
    detail,
    expand = 0,
    size = 16,
    snap = false,

    font,
    spans,
    glyphs,
    breaks,
    height,
    lines,

    clip,
    transform,
  } = props;

  const { getGlyph, getScale, getRadius } = useSDFFontContext();

  return useMemo(() => {
    const adjust = size / (detail ?? size);
    const radius = getRadius();
    const scale = getScale(detail ?? size) * adjust;

    const fill = color.slice();
    fill[3] *= opacity;
  
    const rectangles = [] as number[];
    const uvs = [] as number[];
    let count = 0;

    const bounds = [Infinity, Infinity, -Infinity, -Infinity];

    for (const {layout, start, end, gap} of lines) {
      const [l, t] = layout;

      const {ascent, lineHeight} = height;
      let x = l;
      let y = t + ascent;
      
      let first = true;

      let sx = x;
      spans.iterate((_a, trim, _h, index) => {
        glyphs.iterate((fontIndex: number, glyphId: number, isWhiteSpace: number, kerning: number) => {
          const {glyph, mapping} = getGlyph(font[fontIndex], glyphId, detail ?? size);
          const {image, layoutBounds, outlineBounds, rgba, scale: glyphScale} = glyph;
          const [ll, lt, lr, lb] = layoutBounds;      

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

              const left   = (s * gl) + cx;
              const top    = (s * gt) + cy;
              const right  = (s * gr) + cx;
              const bottom = (s * gb) + cy;

              rectangles.push(left, top, right, bottom);
              uvs.push(r * mapping[0], r * mapping[1], r * mapping[2], r * mapping[3]);

              bounds[0] = Math.min(bounds[0], left);
              bounds[1] = Math.min(bounds[1], top);
              bounds[2] = Math.max(bounds[2], right);
              bounds[3] = Math.max(bounds[3], bottom);

              count++;
            }
          }

          sx += lr * scale;
          x += lr * scale;
        }, breaks[index - 1] || 0, breaks[index]);

        if (trim) {
          x += gap;
          sx = snap ? Math.round(x) : x;
        }
      }, start, end);
    }

    const render = count ? {
      id,
      rectangles,
      uvs,
      // macOS-style font bleed
      border: [expand, Math.min(size / 32, 1.0) * 0.25, 0, 0],
      sdf: [radius, scale, size, 0],
      fill,
      texture: SDF_FONT_ATLAS,
      count,
      clip,
      transform,
      bounds,
    } : null;

    return yeet(render);
  }, [props, getGlyph, getScale, getRadius]);
};
