import type { LiveComponent, LiveElement, LiveNode, LiveFiber, Task, PropsWithChildren } from '@use-gpu/live';
import { use, signal, detach, provide, useCallback, useOne, useResource, tagFunction, formatNodeName } from '@use-gpu/live';

import { FrameContext, usePerFrame } from '../providers/frame-provider';
import { TimeContext } from '../providers/time-provider';
import { LoopContext } from '../providers/loop-provider';

export type LoopProps = {
  live?: boolean,
};

export type LoopRef = {
  time: {
    timestamp: number,
    delta: number,
    elapsed: number,
    start: number,
  },
  frame: number,
  loop: {
    request?: (fiber?: LiveFiber<any>) => void,
  },
  children?: LiveNode,
  run?: () => void,
};

/** Provides `useAnimationFrame` and clock to allow for controlled looping and animation. */
export const Loop: LiveComponent<LoopProps> = (props: PropsWithChildren<LoopProps>) => {
  const {live, children} = props;

  const ref: LoopRef = useOne(() => ({
    time: {
      start: 0,
      timestamp: -Infinity,
      elapsed: 0,
      delta: 0,
    },
    frame: 0,
    loop: {
      request: () => {},
    },
    children,
  }));

  ref.children = children;

  const request = useResource((dispose) => {
    const {time, frame, loop} = ref;
    let running = live;
    let pending = false;
    let fibers: LiveFiber<any>[] = [];

    const render = (timestamp: number) => {
      ref.frame++;
      pending = false;

      if (running) request();

      if (time.timestamp === -Infinity) time.start = timestamp;
      else time.delta = timestamp - time.timestamp;

      time.elapsed = timestamp - time.start;
      time.timestamp = timestamp;

      for (const fiber of fibers) fiber.host?.schedule(fiber);
      fibers.length = 0;

      const {run} = ref;
      if (run) run();

      if (!pending) time.timestamp = -Infinity;
    };

    const request = (fiber?: LiveFiber<any>) => {
      if (!pending) requestAnimationFrame(render);
      if (fiber && fibers.indexOf(fiber) < 0) fibers.push(fiber);
      pending = true;
    };
    dispose(() => running = false);

    return loop.request = request;
  }, [live]);

  usePerFrame();
  request!();

  const Run = useCallback(tagFunction(() => {
    const {time, loop, children} = ref;

    const view = [
      signal(),
      provide(LoopContext, loop, children),
    ];

    const t = {...time};
    return (
      provide(FrameContext, ref.frame,
        provide(TimeContext, t, view)
      )
    );
  }, 'Run'));

  return detach(use(Run), (render: Task) => ref.run = render);
}
