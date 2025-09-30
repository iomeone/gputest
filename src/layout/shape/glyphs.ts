import type { LiveComponent } from '../../live';
import type { Rectangle, Tuples, XYZW } from '../../core';
import type { ShaderModule } from '../../shader';
import type { FontMetrics } from '../../glyph';
import type { InlineLine } from '../types';

import { yeet, useMemo } from '../../live';
import { useSDFFontContext, UI_SCHEMA } from '../../workbench';
import { getOriginProjectionX, getOriginProjectionY } from '../lib/util';
import { schemaToArchetype } from '../../core';

const BLACK = [0, 0, 0, 1];

export type GlyphsProps = {
  color?: XYZW,
  opacity?: number,
  size?: number,
  detail?: number,
  expand?: number,
  hint?: 'x' | 'y' | 'xy' | false,
  monochrome?: boolean,

  font: number[],
  spans: Tuples<3>,
  glyphs: Tuples<2>,
  breaks: Uint32Array,
  height: FontMetrics,
  lines: InlineLine[],

  origin: Rectangle,
  zIndex: number,
  clip?: ShaderModule | null,
  mask?: ShaderModule | null,
  transform?: ShaderModule | null,
};

export const Glyphs: LiveComponent<GlyphsProps> = (props) => {
  const {
    color = BLACK,
    opacity = 1,
    expand = 0,
    size = 16,
    detail = size,
    hint = 'xy',
    monochrome = false,

    font,
    spans,
    glyphs,
    breaks,
    height,
    lines,

    origin,
    clip,
    mask,
    transform,
    zIndex,
  } = props;

  const sdfFont = useSDFFontContext();

  return useMemo(() => {
    const { getGlyph, getScale, getRadius, getTexture } = sdfFont;

    const adjust = size / detail;
    const radius = getRadius();
    const scale = getScale(detail) * adjust;
    const texture = getTexture();

    const snapX = hint === 'x' || hint === 'xy';
    const snapY = hint === 'y' || hint === 'xy';

    const fill = color.slice();
    fill[3] *= opacity;

    const rectangles = [] as number[];
    const uvs = [] as number[];
    const sts = [] as number[];
    let count = 0;

    const bounds = [Infinity, Infinity, -Infinity, -Infinity];

    for (const {layout, start, end, gap} of lines) {
      const [l, t] = layout;

      let x = snapX ? Math.round(l) : l;
      let sx = x;

      const {ascent} = height;
      const y = t + ascent;
      const sy = snapY ? Math.round(y) : y;

      spans.iterate((_a, trim, _h, index) => {
        glyphs.iterate((fontIndex: number, glyphId: number, isWhiteSpace: number, kerning: number) => {
          const {glyph, mapping} = getGlyph(font[fontIndex], glyphId, detail);
          const {image, layoutBounds, outlineBounds, rgba, scale: glyphScale} = glyph;
          const [,,lr,] = layoutBounds;

          const r = rgba && !monochrome ? -1 : 1;
          const s = scale * glyphScale;
          const k = kerning / 65536.0 * scale;
          x += k;
          sx += k;

          if (!isWhiteSpace) {
            if (image && outlineBounds) {
              const [gl, gt, gr, gb] = outlineBounds;

              const cx = sx;
              const cy = sy;

              const left   = (s * gl) + cx;
              const top    = (s * gt) + cy;
              const right  = (s * gr) + cx;
              const bottom = (s * gb) + cy;

              rectangles.push(left, top, right, bottom);
              uvs.push(r * mapping[0], r * mapping[1], r * mapping[2], r * mapping[3]);
              sts.push(
                getOriginProjectionX(left, origin),
                getOriginProjectionY(top, origin),
                getOriginProjectionX(right, origin),
                getOriginProjectionY(bottom, origin),
              );

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
          sx = snapX ? Math.round(x) : x;
        }
      }, start, end);
    }

    if (!count) return null;

    const attributes = {
      rectangles,
      uvs,
      sts,
      // macOS-style font bleed
      border: [expand, Math.min(size / 32, 1.0) * 0.25, 0, 0],
      sdf: [radius, scale, size, 0],
      fill,
    };

    return yeet({
      count,
      archetype: schemaToArchetype(UI_SCHEMA, attributes),

      attributes,
      bounds,
      texture,
      clip,
      mask,
      transform,
      zIndex,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props, sdfFont, zIndex]);
};
