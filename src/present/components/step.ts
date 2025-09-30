import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { TraitProps } from '@use-gpu/traits';
import type { ParsedEffect, } from '../types';

import { unquote, fence, yeet, use, useMemo, useOne, useFiber } from '@use-gpu/live';
import { useLayoutContext } from '@use-gpu/workbench';
import { Transform } from '@use-gpu/layout';

import { merge } from '../lib/slides';
import { usePresentTransition } from '../hooks';
import { SlideTrait, TransitionTrait, useSlideTrait, makeUseTransitionTrait } from '../traits';

export type StepProps = PropsWithChildren<TraitProps<typeof SlideTrait> & TraitProps<typeof TransitionTrait>>;

const useTransitionTrait = makeUseTransitionTrait({ effect: { type: 'wipe', duration: 0.15 } });

export const Step: LC<StepProps> = (props: StepProps) => {
  const {children} = props;
  const {order, stay} = useSlideTrait(props);
  const {effect, enter, exit} = useTransitionTrait(props);

  const enterEffect = useOne(() => merge(effect, enter) as ParsedEffect, [effect, enter]);
  const exitEffect = useOne(() => merge(effect, exit) as ParsedEffect, [effect, exit]);

  const {id} = useFiber();
  const layout = useLayoutContext();
  const {useUpdateTransition, mask, transform} = usePresentTransition(id, layout, enterEffect, exitEffect);

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
      return useMemo(() => use(Transform, {mask, transform, children}), [mask, transform, children]);
    },
  );
};
