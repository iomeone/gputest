import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { TensorArray } from '@use-gpu/core';

import { yeet, provide, useMemo, useNoMemo, useOne } from '@use-gpu/live';
import { makeCopyPipe, toCPUDims } from '@use-gpu/core';
import { getRenderFunc } from '@use-gpu/workbench';
import { parseAxes } from '@use-gpu/parse';

import { useDataContext, DataContext } from '../providers/data-provider';
import { toOrder } from '../util/swizzle';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const toModulus = (size: number[]) => size.reduce((a, b) => (a.push(a.at(-1)! * b), a), [1]);

export type TransposeProps = {
  axes?: string,
  as?: string,
  tensor?: TensorArray,

  render?: (data: TensorArray) => LiveElement,
  children?: LiveElement | ((data: TensorArray) => LiveElement),
};

export const Transpose: LiveComponent<TransposeProps> = (props) => {
  const {
    axes = 'xyzw',
    as = 'positions',
    children,
    tensor,
  } = props;

  const dataContext = useDataContext();
  const data = tensor ?? dataContext[as];
  if (!data) return;

  const swizzle = useOne(() => parseAxes(axes), axes);
  const {array, size, dims} = data;

  const value = useMemo(() => {
    const order = toOrder(swizzle);

    const sizeIn = [...size];
    while (sizeIn.length < order.length) sizeIn.push(1);
    const sizeOut = order.map(i => sizeIn[i]);

    const modulusIn = toModulus(sizeIn);
    const modulusOut = toModulus(sizeOut);

    const index = (i: number) => {
      let j = 0;
      let accum = 0;
      for (const b of order) {
        const k = ((i % modulusOut[j + 1]) / modulusOut[j]) | 0;
        accum += k * modulusIn[b];
        ++j;
      }
      return accum;
    };

    const out = array.slice();
    makeCopyPipe({index})(array, out, toCPUDims(dims));

    return {
      ...data,
      array: out,
      size: sizeOut,
    };
  }, [size, swizzle, data]);

  const render = getRenderFunc(props);

  const context = !render && children ? useMemo(() => ({...dataContext, [as]: value}), [dataContext, value, as]) : useNoMemo();

  return render ? render(value) : children ? provide(DataContext, context, children) : yeet(value);
};
