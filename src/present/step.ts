import type { LC, LiveElement, PropsWithChildren } from '../live';
import type { DeepPartial } from '../core';
import type { ParsedEffect, SlideTrait, TransitionTrait } from './types';

import { unquote, fence, yeet, use, useMemo, useOne, useFiber } from '../live';
import { useLayoutContext } from '../workbench';
import { Transform } from '../layout';

import { merge } from './lib/slides';
import { usePresentTransition } from './hooks';
import { useSlideTrait, makeUseTransitionTrait } from './traits';

export type StepProps = Partial<SlideTrait> & DeepPartial<TransitionTrait>;

const useTransitionTrait = makeUseTransitionTrait({ effect: { type: 'wipe', duration: 0.15 } });

export const Step: LC<StepProps> = (props: PropsWithChildren<StepProps>) => {
  const {children} = props;
  const {order, stay} = useSlideTrait(props);
  const {effect, enter, exit} = useTransitionTrait(props as any);

  const enterEffect = useOne(() => merge(effect, enter) as ParsedEffect, [effect, enter]);
  const exitEffect = useOne(() => merge(effect, exit) as ParsedEffect, [effect, exit]);

  const {id} = useFiber();
  const layout = useLayoutContext();
  const {useUpdateTransition, ...transform} = usePresentTransition(id, layout, enterEffect, exitEffect);

  return fence(
    unquote(yeet({
      id,
      order,
      steps: 1,
      stay,
      sticky: true,
    })),
    () => {
      useUpdateTransition();
      return useMemo(() => use(Transform, {...transform, children}), [transform, children]);
    },
  );
};
