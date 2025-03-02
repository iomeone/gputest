import type { LC, LiveElement } from '@use-gpu/live';
import type { Lazy } from '@use-gpu/core';
import { gather, unquote, use, memo, yeet, useHooks, useMemo, useOne, useRef } from '@use-gpu/live';
import { useRenderProp } from '../hooks/useRenderProp';
import { useAnimationFrame } from '../providers/loop-provider';
import { QueueReconciler } from '../reconcilers/index';
import { RenderToTexture } from '../render/render-to-texture';

const {reconcile, quote, signal} = QueueReconciler;

const DEBUG = true;

type RenderProp = (frame: Lazy<number>) => LiveElement;
type ThenProp = (frame: Lazy<number>, converged: Lazy<boolean>) => LiveElement;

export type AccumulateRenderProps = {
  target?: UseGPURenderContext,

  continued?: boolean,
  frames?: number,
  limit?: number,
  version?: number,

  render?: RenderProp,
  children?: RenderProp,

  then?: ThenProp,
};

/** Iteration combinator for gathered render passes */
export const AccumulateRender: LC<AccumulateRenderProps> = memo((props: AccumulateRenderProps) => {
  const {
    target,
    continued = false,
    frames = 1,
    version = 0,
    limit,

    then,
  } = props;

  const {source: {history}} = target;
  if (!history || !history.length) throw new Error("<AccumulateRender> target must have history > 0");

  const frameRef = useRef(0);
  const convergedRef = useRef(false);

  const children = useRenderProp(props, frameRef);
  const next = useHooks(() => then(frameRef, convergedRef), [then]);

  useAnimationFrame();

  return [
    signal(),
    reconcile(
      quote(
        gather(
          unquote(use(RenderToTexture, {target, children})),
          (fs: ArrowFunction[]) => {

            useMemo(() => {
              if (!continued) frameRef.current = 0;
            }, [continued, ...fs]);

            useOne(() => {
              frameRef.current = 0;
            }, version);

            return useMemo(() => {
              const run = () => {
                const {current: frame} = frameRef;

                if (limit != null && frame >= limit) return;

                for (const f of fs) f();
                frameRef.current++;
                convergedRef.current = frameRef.current >= frames;
              };

              return [
                signal(), // Extra signal so that yeet(ts) can be memoized and doesn't invalidate the next queue
                quote(yeet(run)),
              ];
            }, fs);
          }
        )
      )
    ),
    next,
  ];
}, 'AccumulateRender');
