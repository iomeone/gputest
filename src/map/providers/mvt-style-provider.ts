import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { DeepPartial } from '@use-gpu/core';
import type { MVTStyleProperties } from '../types';

import { patch } from '@use-gpu/state';
import { parseColor } from '@use-gpu/parse';
import { provide, makeContext, useContext, useNoContext, useOne } from '@use-gpu/live';

export type MVTStyleContextProps = Record<string, MVTStyleProperties>;

const DEFAULT_STYLE: MVTStyleProperties = {
  face: {
    fill: [0.5, 0.5, 0.5, 1],
    stroke: [1, 1, 1, 1],
    width: 2,
    depth: 0.5,
    zBias: 0,
  },
  line: {
    color: [1, 1, 1, 1],
    width: 2,
    depth: 0.5,
    zBias: 2,
  },
  point: {
    color: [1, 1, 1, 1],
    shape: 'circle',
    size: 5,
    depth: 0.5,
    zBias: 5,
    hollow: false,
  },
  font: {
    family: 'sans-serif',
    style: 'normal',
    weight: 'normal',
    size: 16,
    lineHeight: 20,
  },
};

export const MVTStyleContext = makeContext<MVTStyleContextProps>({
  default: DEFAULT_STYLE,
}, 'MVTStyleContext');

export const useMVTStyleContext = () => useContext<MVTStyleContextProps>(MVTStyleContext);
export const useNoMVTStyleContext = () => useNoContext(MVTStyleContext);

export type MVTStylesProps = PropsWithChildren<{
  styles: DeepPartial<MVTStyleContextProps>,
}>;

export const MVTStyles: LiveComponent<MVTStylesProps> = (props: MVTStylesProps) => {
  const {styles, children} = props;

  const context = useOne(() => {
    const parseStyle = (style: any, def: any) => {
      const out = patch(def, style);
      if (style.face?.fill) out.face.fill = parseColor(style.face.fill);
      if (style.face?.stroke) out.face.stroke = parseColor(style.face.stroke);
      if (style.point?.color) out.point.color = parseColor(style.point.color);
      if (style.line?.color) out.line.color = parseColor(style.line.color);
      return out;
    };

    const out: MVTStyleContextProps = {
      default: parseStyle(styles.default ?? {}, DEFAULT_STYLE),
    };

    const def = out.default;
    for (const k in styles) if (k !== 'default') {
      out[k] = parseStyle(styles[k], def);
    }

    return out;
  }, styles);

  return provide(MVTStyleContext, context, children);
};
