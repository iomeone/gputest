import type { LiveComponent } from '@use-gpu/live';
import type { TextureSource, Rectangle, Point4 } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import type { ImageTrait, Fit, Repeat, Anchor } from '../types';

import { use, yeet, memo, useContext, useMemo, useNoContext } from '@use-gpu/live';
import { LayoutContext, getAlignmentAnchor } from '@use-gpu/workbench';

import { evaluateDimension, parseAnchorXY } from '../parse';
import { getOriginProjection } from '../lib/util';
import { ARCHETYPES } from '../types';

const UV_SQUARE = [0, 0, 1, 1] as Rectangle;
const NO_RECTANGLE = [0, 0, 0, 0] as Rectangle;

const REPEAT_FLAG = {
  'none': 0,
  'x':    1,
  'y':    2,
  'xy':   3,
};

export type UIRectangleProps = {
  id: number,
  layout?: Rectangle,
  origin?: Rectangle,

  image?: Partial<ImageTrait>,

  fill?: Point4,
  stroke?: Point4,
  border?: Point4,
  radius?: Point4,

  clip?: ShaderModule | null,
  mask?: ShaderModule | null,
  transform?: ShaderModule | null,
};

export const UIRectangle: LiveComponent<UIRectangleProps> = (props) => {
  const {
    id,
    image,

    fill,
    stroke,
    radius,
    border,

    origin = NO_RECTANGLE,
    clip,
    mask,
    transform,
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
    
    const sampledTexture = useMemo(() => {
      if (!image?.texture) return null;

      const {texture, repeat} = image;
      if (!('sampler' in texture)) return null;

      const addressModeU = repeat === 'x' || repeat === 'xy' ? 'repeat' : 'clamp-to-edge';
      const addressModeV = repeat === 'y' || repeat === 'xy' ? 'repeat' : 'clamp-to-edge';
      const sampler = texture.sampler !== null ? {
        minFilter: 'linear',
        magFilter: 'linear',
        ...texture.sampler,
      } : null;

      return {...texture, sampler};
    }, [image?.texture, image?.repeat]);

    if (sampledTexture) {
      // Update volatile texture
      if ('texture' in image!.texture!) {
        sampledTexture.texture = image!.texture!.texture;
        sampledTexture.view    = image!.texture!.view;
        sampledTexture.size    = image!.texture!.size;
      }
    }
  
    let boxW = layout[2] - layout[0];
    let boxH = layout[3] - layout[1];
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
    if (image && image.texture) {
      const {
        texture,
        fit,
        width,
        height,
        repeat,
        align,
      } = image;

      let uv = UV_SQUARE;
      if ((texture as any).size) {
        const {size} = texture as any;
 
        if (fit !== 'scale') {
 
          let w = (width != null ? evaluateDimension(width, size[0], false) : size[0])!;
          let h = (height != null ? evaluateDimension(height, size[1], false) : size[1])!;

          if (fit === 'contain') {
            let fitW = boxW / w;
            let fitH = boxH / h;
            let scale = Math.min(fitW, fitH);
            w *= scale;
            h *= scale;
          }
          else if (fit === 'cover') {
            let fitW = boxW / w;
            let fitH = boxH / h;
            let scale = Math.max(fitW, fitH);
            w *= scale;
            h *= scale;
          }

          const [alignX, alignY] = parseAnchorXY(align);
          let left   = getAlignmentAnchor(alignX) * (boxW - w);
          let top    = getAlignmentAnchor(alignY) * (boxH - h);
          let right  = boxW - (left + w);
          let bottom = boxH - (top + h);

          uv = [
            -left / w,
            -top / h,
            1 + right / w,
            1 + bottom / h,
          ];
        }
      }

      render = {
        id,
        rectangle: layout,
        radius,
        border,
        stroke,
        fill,
      
        texture: sampledTexture ?? image?.texture,
        repeat: (repeat != null ? REPEAT_FLAG[repeat] : repeat) ?? 0,
        uv,
        st,

        bounds: layout,
        count: 1,
        transform,
        archetype: ARCHETYPES.textured,
      };
    }
    else {
      render = {
        id,
        rectangle: layout,
        radius,
        border,
        stroke,
        fill,
        
        st,

        bounds: layout,
        count: 1,
        clip,
        mask,
        transform,
        archetype: ARCHETYPES.solid,
      };
    }

    return yeet(render);
  }, [
    id,
    image,

    fill,
    stroke,
    radius,
    border,

    clip,
    mask,
    transform,
    ...layout,
    ...origin,
  ]);
};
