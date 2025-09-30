import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { UIAggregate } from '@use-gpu/layout';
import type { TraitProps } from '@use-gpu/traits';
import type { ParsedEffect, SlideInfo } from '../types';

import { unquote, gather, yeet, use, useFiber, useMemo, useOne } from '@use-gpu/live';
import { useLayoutContext } from '@use-gpu/workbench';
import { Transform } from '@use-gpu/layout';

import { PresentReconciler } from '../reconcilers';
import { merge, resolveSlides } from '../lib/slides';
import { SlideTrait, TransitionTrait, useSlideTrait, makeUseTransitionTrait } from '../traits';
import { usePresentTransition } from '../hooks';

import { CaptureLayout } from './capture-layout';

const {quote} = PresentReconciler;

export type OverlayProps = PropsWithChildren<TraitProps<typeof SlideTrait> & TraitProps<typeof TransitionTrait>>;

const useTransitionTrait = makeUseTransitionTrait({ effect: { type: 'fade', duration: 0.5 } });

export const Overlay: LC<OverlayProps> = (props: OverlayProps) => {
  const {children} = props;
  const {order, stay} = useSlideTrait(props);
  const {effect, enter, exit} = useTransitionTrait(props);

  const enterEffect = useOne(() => merge(effect, enter) as ParsedEffect, [effect, enter]);
  const exitEffect = useOne(() => merge(effect, exit) as ParsedEffect, [effect, exit]);

  const {id} = useFiber();
  const layout = useLayoutContext();
  const {useUpdateTransition, ...transform} = usePresentTransition(id, layout, enterEffect, exitEffect);

  const view = useMemo(() => use(Transform, {...transform, children}), [transform, children]);

  return (
    unquote(
      gather(
        quote(
          use(CaptureLayout, {
            children: view,
            then: (ops: UIAggregate[]) => {
              useUpdateTransition();

              return useMemo(
                () => yeet({
                  id,
                  ops,
                }),
                [id, ops]
              );
            }
          })
        ),
        (slides: SlideInfo[]) => {
          const {resolved} = resolveSlides(slides);
          return yeet({
            id,
            order,
            steps: 0,
            thread: false,
            stay,
            slides: resolved,
            sticky: false,
          });
        },
      )
    )
  );
};
