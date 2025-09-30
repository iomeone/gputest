import type { LiveComponent } from '@use-gpu/live';
import type { Rectangle, XYZW } from '@use-gpu/core';
import type { ShaderModule, ShaderSource } from '@use-gpu/shader';
import type { TraitProps } from '@use-gpu/traits';

import { ImageTrait } from '../traits';
import { proxy } from '@use-gpu/core';
import { yeet, useContext, useMemo, useNoContext } from '@use-gpu/live';
import { LayoutContext, getAlignmentAnchor, UI_SCHEMA } from '@use-gpu/workbench';
import { schemaToArchetype } from '@use-gpu/core';

import { evaluateDimension, parseAnchorXY } from '../parse';
import { getOriginProjection } from '../lib/util';

const UV_SQUARE = [0, 0, 1, 1] as Rectangle;
const NO_RECTANGLE = [0, 0, 0, 0] as Rectangle;

const REPEAT_FLAG: Record<string, number> = {
  'none': 0,
  'x':    1,
  'y':    2,
  'xy':   3,
};

export type SDFRectangleProps = {
  layout?: Rectangle,
  origin?: Rectangle,
  zIndex?: number,

  texture?: ShaderSource | null,
  image?: Partial<TraitProps<typeof ImageTrait>>,

  fill?: XYZW,
  stroke?: XYZW,
  border?: XYZW,
  radius?: XYZW,

  clip?: ShaderModule | null,
  mask?: ShaderModule | null,
  transform?: ShaderModule | null,
};

let DEPRECATED_WARNING = false;

export const SDFRectangle: LiveComponent<SDFRectangleProps> = (props) => {
  const {
    texture,
    image,

    fill,
    stroke,
    radius,
    border,

    origin = NO_RECTANGLE,
    clip,
    mask,
    transform,
    zIndex = 0,
  } = props;

  let layout: Rectangle = NO_RECTANGLE;
  if (props.layout) {
    layout = props.layout;
    useNoContext(LayoutContext);
  }
  else {
    layout = useContext(LayoutContext);
  }

  return useMemo(() => {
    const st = origin ? getOriginProjection(layout, origin) : UV_SQUARE;
    const tex = texture ?? image?.texture;
    const repeat = image?.repeat;

    if (!DEPRECATED_WARNING && image?.texture) {
      console.warn("<Element image={{texture}}> is deprecated. Pass directly as texture={texture}.");
      DEPRECATED_WARNING = true;
    }

    const sampledTexture = useMemo(() => {
      if (!tex) return null;

      if (!('sampler' in tex)) return null;

      const addressModeU = repeat === 'x' || repeat === 'xy' ? 'repeat' : 'clamp-to-edge';
      const addressModeV = repeat === 'y' || repeat === 'xy' ? 'repeat' : 'clamp-to-edge';
      const sampler = tex.sampler !== null ? {
        minFilter: 'linear',
        magFilter: 'linear',
        ...tex.sampler,
        addressModeU,
        addressModeV,
      } : null;

      return proxy(tex, {sampler});
    }, [tex, repeat]);

    const boxW = layout[2] - layout[0];
    const boxH = layout[3] - layout[1];
    if (radius) {
      let [tl, tr, br, bl] = radius;

      // Clip radius to size
      if (tl + tr > boxW) {
        const f = boxW / (tl + tr);
        tl *= f;
        tr *= f;
      }
      if (bl + br > boxW) {
        const f = boxW / (bl + br);
        bl *= f;
        br *= f;
      }
      if (tl + bl > boxH) {
        const f = boxH / (tl + bl);
        tl *= f;
        bl *= f;
      }
      if (tr + br > boxH) {
        const f = boxH / (tr + br);
        tr *= f;
        br *= f;
      }

      radius[0] = tl;
      radius[1] = tr;
      radius[2] = br;
      radius[3] = bl;
    }

    let render;
    if (image && tex) {
      const {
        fit,
        width,
        height,
        repeat,
        align,
      } = image;

      let uv = UV_SQUARE;
      if ('size' in tex) {
        const {size} = tex;

        if (fit !== 'scale') {

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          let w = (width != null ? evaluateDimension(width, size[0], false) : size[0])!;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          let h = (height != null ? evaluateDimension(height, size[1], false) : size[1])!;

          if (fit === 'contain') {
            const fitW = boxW / w;
            const fitH = boxH / h;
            const scale = Math.min(fitW, fitH);
            w *= scale;
            h *= scale;
          }
          else if (fit === 'cover') {
            const fitW = boxW / w;
            const fitH = boxH / h;
            const scale = Math.max(fitW, fitH);
            w *= scale;
            h *= scale;
          }

          const [alignX, alignY] = parseAnchorXY(align);
          const left   = getAlignmentAnchor(alignX) * (boxW - w);
          const top    = getAlignmentAnchor(alignY) * (boxH - h);
          const right  = boxW - (left + w);
          const bottom = boxH - (top + h);

          uv = [
            -left / w,
            -top / h,
            1 + right / w,
            1 + bottom / h,
          ];
        }
      }

      const attributes = {
        rectangle: layout,
        radius: radius ?? NO_RECTANGLE,
        border,
        stroke,
        fill,
        uv,
        st,
        repeat: (repeat != null ? REPEAT_FLAG[repeat] : repeat) ?? 0,
      };

      return yeet({
        count: 1,
        archetype: schemaToArchetype(UI_SCHEMA, attributes),

        attributes,
        bounds: layout,
        transform,
        texture: sampledTexture ?? tex,
      });
    }
    else {
      const attributes = {
        rectangle: layout,
        radius: radius ?? NO_RECTANGLE,
        border,
        stroke,
        fill,
        st,
      };

      return yeet({
        count: 1,
        archetype: schemaToArchetype(UI_SCHEMA, attributes),
        zIndex,

        attributes,
        bounds: layout,
        clip,
        mask,
        transform,
      });
    }

    return yeet(render);
  }, [
    image,
    texture,

    fill,
    stroke,
    radius,
    border,

    zIndex,
    clip,
    mask,
    transform,
    ...layout,
    ...origin,
  ]);
};
