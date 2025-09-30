import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { ColorLike } from '@use-gpu/core';
import type { ParsedEffect, ResolvedLayer } from '../types';

import { gather, use, wrap, keyed, memo, useMemo, useRef } from '@use-gpu/live';
import {
  SDFFontProvider,
  Pass, RenderTarget,
} from '@use-gpu/workbench';
import { UILayers } from '@use-gpu/layout';

import { PresentAPI } from '../providers/present-provider';
import { Screen } from './screen';

export type StageProps = PropsWithChildren<{
  step: number,
  api: PresentAPI,
  backgroundColor: ColorLike,
  version: number,
}>;

// Presentation view renderer
export const Stage: LC<StageProps> = memo((props: StageProps) => {
  const {api, backgroundColor, children} = props;

  // Render keyed layers for entering and exiting
  const renderLayer = (
    {id, ops}: ResolvedLayer,
    effect: ParsedEffect,
    opaque: boolean = false,
    initial?: number,
  ) => (
    keyed(RenderTarget, id, {
      format: 'rgba16float',
      colorSpace: 'linear',
      depthStencil: null,
      samples: 1,
      children: wrap(Pass, use(UILayers, {items: ops})),
      then: (texture) => use(Screen, {
        id,
        texture,
        effect,
        opaque,
        initial,
        fill: backgroundColor,
      }),
    })
  );

  return gather(
    wrap(SDFFontProvider, children),
    (layers: ResolvedLayer[]) => {

      // Find main slide thread + extra floats
      const threads = layers.filter(({id}) =>  api.isThread(id));
      const floats  = layers.filter(({id}) => !api.isThread(id));

      const threadIds = threads.map(({id}) => id);

      // Get entering slide (only one at a time)
      const entering = threadIds.filter((id) => api.isVisible(id))[0] ?? null;

      // Track exiting state
      const exitingRef = useRef<number | null>(null);
      const lastEnteringRef = useRef<number | null>(null);

      let {current: exiting} = exitingRef;
      let {current: lastEntering} = lastEnteringRef;

      if (lastEntering !== entering) {
        exitingRef.current = exiting = lastEntering;
        lastEnteringRef.current = lastEntering = entering;
      }

      // Merge exit / entering effects
      const enteringIndex = threadIds.indexOf(entering);
      const exitingIndex = threadIds.indexOf(exiting || -1);

      const enteringLayer = threads[enteringIndex];
      const exitingLayer = threads[exitingIndex];

      const effect = threads[Math.max(enteringIndex, exitingIndex)]?.enter;

      // Layer pair
      const stage = useMemo(() => [
        (exitingLayer && exitingLayer !== enteringLayer)
          ? renderLayer(
              exitingLayer,
              effect,
              !!enteringLayer,
            )
          : null,
        enteringLayer
          ? renderLayer(
              enteringLayer,
              effect,
              false,
              exitingLayer ? Math.sign(exitingIndex - enteringIndex) : undefined,
            )
          : null,
        floats.map(({id, ops}) => (
          keyed(UILayers, id, {items: ops})
        ))
      ], [enteringLayer, exitingLayer, effect, floats]);

      return stage;
    }
  );
}, 'Stage');
