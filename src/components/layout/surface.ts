import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { TextureSource } from '@use-gpu/core/types';

import { use, yeet, useContext, useMemo, useNoContext } from '@use-gpu/live';
import { LayoutContext } from '../providers/layout-provider';
import { LayerType } from '../layers/types';
import { Rectangle, ImageAttachment, Fit, Repeat, Anchor, Point4 } from './types';

import { parseDimension, parseAnchor, normalizeAnchor } from './lib/util';

import { Rectangles } from '../layers';

const UV_SQUARE = [0, 0, 1, 1];

const REPEAT_FLAG = {
  'none': 0,
  'x':    1,
  'y':    2,
  'xy':   3,
};

export type SurfaceProps = {
  id: number,
  layout: Rectangle,

  image?: ImageAttachment,

  fill?: Point4,
  stroke?: Point4,
  border?: Point4,
  radius?: Point4,
};

export const Surface: LiveComponent<SurfaceProps> = (props) => {
  const {
    id,
    image,

    fill,
    stroke,
    radius,
    border,
  } = props;

  let layout;
  if (props.layout) {
    layout = props.layout;
    useNoContext(LayoutContext);
  }
  else {
    layout = useContext(LayoutContext);
  }

  const sampledTexture = useMemo(() => {
    if (!image) return null;
    
    const {texture, repeat} = image;
    const addressModeU = repeat === 'x' || repeat === 'xy' ? 'repeat' : 'clamp-to-edge';
    const addressModeV = repeat === 'y' || repeat === 'xy' ? 'repeat' : 'clamp-to-edge';

    const sampler = {
      minFilter: 'linear',
      magFilter: 'linear',
      ...texture.sampler,
      addressModeU,
      addressModeV,
    };

    return {
      ...texture,
      sampler,
    };
  }, [image?.texture, image?.repeat]);

  let render;
  if (image) {
    const {
      texture,
      fit,
      width,
      height,
      repeat = 'none',
      align = 'center',
    } = image;
    const {size} = texture;

    let uv = UV_SQUARE;

    if (fit !== 'scale') {
      let boxW = layout[2] - layout[0];
      let boxH = layout[3] - layout[1];
 
      let w = width != null ? parseDimension(width, size[0], false) : size[0];
      let h = height != null ? parseDimension(height, size[1], false) : size[1];

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

      const [alignX, alignY] = normalizeAnchor(align);
      let left   = parseAnchor(alignX) * (boxW - w);
      let top    = parseAnchor(alignY) * (boxH - h);
      let right  = boxW - (left + w);
      let bottom = boxH - (top + h);

      uv = [
        -left / w,
        -top / h,
        1 + right / w,
        1 + bottom / h,
      ];
    }

    render = {
      id,
      rectangle: layout,
      radius,
      border,
      stroke,
      fill,
      
      texture: sampledTexture,
      repeat: REPEAT_FLAG[repeat] ?? 0,
      uv,

      count: 1,
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
      count: 1,
    };
  }

  return yeet(render);
};
