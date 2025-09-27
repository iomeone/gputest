import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { FitInto, Dimension, Direction, LayoutElement } from '../types';

import { use, memo, gather, yeet, useFiber, useMemo } from '@use-gpu/live';
import { fitAbsoluteBox } from '../lib/absolute';
import { makeBoxLayout, makeBoxInspectLayout, makeBoxPicker, memoFit, memoLayout } from '../lib/util';
import { useInspectable, useInspectHoverable } from '@use-gpu/workbench';

import type { ElementTrait } from '../types';
import { useElementTrait } from '../traits';
import { useImplicitElement } from '../element/element';

const NO_POINT4 = [0, 0, 0, 0];

export type AbsoluteProps = Partial<ElementTrait> &
{
  left?: Dimension,
  top?: Dimension,
  right?: Dimension,
  bottom?: Dimension,

  direction?: Direction,

  under?: boolean,
  snap?: boolean,
  children?: LiveElement<any>,
};

export const Absolute: LiveComponent<AbsoluteProps> = memo((props: AbsoluteProps) => {
  const {
    left: l,
    top: t,
    right: r,
    bottom: b,
    direction = 'y',
    under = false,
    snap = true,
    children,
  } = props;

  const { width, height, radius, border, stroke, fill, image } = useElementTrait(props);

  const {id} = useFiber();
  const inspect = useInspectable();
  const hovered = useInspectHoverable();

  const Resume = (els: LayoutElement[]) => {
    return useMemo(() => {
      const fit = (into: FitInto) => {
        const {size, sizes, offsets, renders, pickers} = fitAbsoluteBox(els, into, l, t, r, b, width, height, direction, snap);

        inspect({
          layout: {
            into,
            size,
            sizes,
            offsets,
          },
        });
  
        return {
          size,
          render: memoLayout(hovered ? makeBoxInspectLayout(id, sizes, offsets, renders) : makeBoxLayout(sizes, offsets, renders)),
          pick: makeBoxPicker(id, sizes, offsets, pickers, undefined, undefined, false),
        };
      };

      return yeet({
        sizing: NO_POINT4,
        margin: NO_POINT4,
        absolute: true,
        under,
        fit: memoFit(fit),
        prefit: memoFit(fit),
      });
    }, [props, els, hovered]);
  };

  const c = useImplicitElement(id, radius, border, stroke, fill, image, children);
  return gather(c, Resume);
}, 'Absolute');
