import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { DeepPartial, UniformAttribute } from '@use-gpu/core';
import type { ParsedEffect, SlideTrait, TransitionTrait, SlideInfo } from './types';

import { fragment, unquote, quote, gather, fence, yeet, use, wrap, provide, useFiber, useMemo, useOne, useRef } from '@use-gpu/live';
import { useLayoutContext } from '@use-gpu/workbench';
import { Layout, Transform } from '@use-gpu/layout';

import { merge, resolveSlides } from './lib/slides';
import { useSlideTrait, makeUseTransitionTrait } from './traits';
import { usePresentTransition } from './hooks';

export type OverlayProps = Partial<SlideTrait> & DeepPartial<TransitionTrait> & {
  _foo?: null,
};

const useTransitionTrait = makeUseTransitionTrait({ effect: { type: 'fade', duration: 0.5 } });

export const Overlay: LC<OverlayProps> = (props: PropsWithChildren<OverlayProps>) => {
  const {children} = props;
  const {order, stay} = useSlideTrait(props);
  const {effect, enter, exit} = useTransitionTrait(props as any);

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
          fence(
            wrap(Layout, view),
            (ops: any) => {
              useUpdateTransition();

              return useMemo(
                () => yeet({
                  id,
                  ops,
                }),
                [id, ops]
              );
            }
          )
        ),
        (slides: SlideInfo[]) => {
          const {resolved, length} = resolveSlides(slides);
          const s = length + 1;
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
