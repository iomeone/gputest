import type { LC, LiveElement, ArrowFunction } from '@use-gpu/live';
import type { ComputeToPass, CommandToBuffer } from '../pass/types';

import { yeet, useMemo } from '@use-gpu/live';
import { PassReconciler } from '../reconcilers/index';

const {quote} = PassReconciler;

export type OnProps = {
  dispatch?: ArrowFunction,
  pre?: CommandToBuffer,
  compute?: ComputeToPass,
  post?: CommandToBuffer,
  readback?: ArrowFunction,
  
  render?: ArrowFunction,
};

export const On: LC<OnProps> = (props: OnProps) => {
  const {dispatch, pre, compute, post, readback, render} = props;

  return useMemo(() => {
    
    const out: LiveElement[] = [];
    if (render) out.push(quote(yeet({ dispatch: render })));

    if (dispatch) out.push(yeet({dispatch}));
    if (pre) out.push(yeet({pre}));
    if (compute) out.push(yeet({compute}));
    if (post) out.push(yeet({post}));
    if (readback) out.push(yeet({readback}));

    return out;
  }, [dispatch, pre, compute, post, readback, render]);
};
