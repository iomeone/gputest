import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { TextureSource } from '@use-gpu/core/types';

import { use, yeet, useContext, useNoContext } from '@use-gpu/live';
import { LayoutContext } from '../providers/layout-provider';
import { LayerType } from '../layers/types';
import { Rectangle } from '../layout/types';

import { Rectangles } from '../layers';

export type SurfaceProps = {
  layout: Rectangle,

  image?: TextureSource,
  imageFit?: Fit,
  imageRepeat?: Repeat,
  imageAlign?: Anchor | [Anchor, Anchor],

  fill?: Point4,
  stroke?: Point4,
  border?: Point4,
  radius?: Point4,
};

export const Surface: LiveComponent<SurfaceProps> = (props) => {
  const {
    image,
    imageFit,
    imageRepeat,
    imageAlign,

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

  const render = {
    rectangle: {
      rectangle: layout,
      radius,
      border,
      stroke,
      fill,
      //uv:     [0, 0, 1, 1],
      count: 1,
    }
  };

  return yeet(render);
};
