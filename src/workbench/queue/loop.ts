import type { LiveComponent, LiveElement, LiveNode, LiveFiber, Task, PropsWithChildren, ArrowFunction } from '@use-gpu/live';
import { use, detach, provide, unquote, yeet, gather, useCallback, useContext, useOne, useResource, useState, tagFunction, incrementVersion } from '@use-gpu/live';

import { useRenderContext } from '../providers/render-provider';
import { FrameContext, usePerFrame } from '../providers/frame-provider';
import { TimeContext, TimeContextProps } from '../providers/time-provider';
import { LoopContext } from '../providers/loop-provider';
import { QueueReconciler } from '../reconcilers/index';

const {reconcile, quote, signal} = QueueReconciler;

const START = +new Date();
const DEBUG = false;

export type LoopProps = PropsWithChildren<{
  live?: boolean,
}>;

export type LoopRef = {
  time: {
    timestamp: number,
    delta: number,
    elapsed: number,
    start: number,
  },
  version: {
    frame: number,
    rendered: number,
    pending: boolean,
    queued: boolean,
    request: number | null,
  },
  loop: {
    request?: (fiber?: LiveFiber<any>) => TimeContextProps,
  },
  children?: LiveNode,

  run?: () => void,
  dispatch?: () => void,
};

/** Provides `useAnimationFrame` and clock to allow for controlled looping and animation. */
export const Loop: LiveComponent<LoopProps> = (props: LoopProps) => {
  const {live, children} = props;
  const parent = useContext(LoopContext);

  const ref: LoopRef = useOne(() => ({
    time: {
      start: 0,
      timestamp: -Infinity,
      elapsed: 0,
      delta: 0,
    },
    version: {
      frame: 0,
      rendered: 0,
      pending: false,
      queued: false,
      request: null,
    },
    loop: {
      buffered: true,
      request: () => ref.time,
    },
    children,
  }));

  ref.children = children;

  // Don't nest requestAnimationFrame when <Loop> is nested.
  const isSync = !!parent.buffered;

  // Bump the frame version to tell the dispatcher an animation frame is in progress
  const requestImmediateRender = useCallback(() => {
    ref.version.frame = incrementVersion(ref.version.frame);
  });

  // Request animation frame wrapper
  // for looped component re-rendering.
  const render = useResource((dispose) => {
    const {time, loop} = ref;
    const fibers: LiveFiber<any>[] = [];

    let mounted = true;
    dispose(() => mounted = false);

    const request = (fiber?: LiveFiber<any>) => {
      DEBUG && !ref.version.pending && console.log(
        'Request animation frame',
        +new Date() - START
      );

      // Enqueue animated fiber for next frame
      if (!ref.version.pending) ref.version.request = requestAnimationFrame(render);
      if (fiber && fibers.indexOf(fiber) < 0) fibers.push(fiber);
      ref.version.pending = true;

      // Ensure parent is also a sync animation frame
      parent.request();

      return ref.time;
    };

    const resetIfIdle = () => {
      if (!ref.version.pending) {
        requestAnimationFrame(() => time.timestamp = -Infinity);
      }
    };

    const render = (timestamp?: number) => {
      DEBUG && console.log('Dispatch loop', +new Date() - START);
      requestImmediateRender();

      ref.version.pending = false;
      ref.version.request = null;

      // Abort on unmount
      if (!mounted) {
        DEBUG && console.log('Unmounted');
        return;
      }

      // Loop continuously if live
      if (live && mounted) request();

      // Start elapsed timer once we have timing info
      if (timestamp != null) {

        // Check for variable frame rate shenanigans
        if (timestamp - time.timestamp < 3) return request();

        if (time.timestamp === -Infinity) time.start = timestamp;
        else time.delta = timestamp - time.timestamp;

        time.elapsed = timestamp - time.start;
        time.timestamp = timestamp;
      }

      // Schedule enqueued fibers from last frame
      for (const fiber of fibers) fiber.host?.schedule(fiber);
      fibers.length = 0;

      // Render detached children
      const {run} = ref;
      if (run) run();

      // Check if animation stopped
      queueMicrotask(resetIfIdle);
    };

    loop.request = request;
    return render;
  }, [live]);

  useRenderContext();
  usePerFrame();

  const Run = useCallback(tagFunction(() => {
    const {time, children} = ref;

    let view: LiveElement = useOne(() => provide(LoopContext, ref.loop, children), children);

    const t = {...time};
    view = [
      provide(FrameContext, ref.version.frame,
        provide(TimeContext, t, view)
      )
    ];

    return view;
  }, 'Run'));

  // Intercept unscheduled renders
  // and ensure steady rendering
  // when children change.
  const Resume = (ts: ArrowFunction[]) => {
    DEBUG && console.log('Resume(Loop) rendered');

    const [dispatches, setDispatches] = useState(0);
    const {version} = ref;

    if (isSync) {
      return [
        signal(), // Extra signal so that yeet(ts) can be memoized and doesn't invalidate the next queue
        quote(yeet(ts)),
      ];
    }

    // In animation frame or after self-render - sync
    if (version.frame != version.rendered) {
      version.rendered = version.frame;
      DEBUG && console.log('Dispatch sync render');
    }
    // Outside animation frame - async
    else if (!version.queued) {
      ref.version.queued = true;

      const {rendered} = version;
      DEBUG && console.log('Schedule async render');
      requestAnimationFrame(() => {
        // If no new calls rendered since last frame, dispatch existing queue
        if (rendered === version.rendered) {
          setDispatches(d => d + 1);
          DEBUG && console.log('Dispatch async render');
        }
        // Otherwise loop did fire
        else DEBUG && console.log('Skip async render');
      });
    }

    return useOne(() => {
      DEBUG && console.log('Dispatch to queue');
      ref.version.queued = false;
      return [
        signal(), // Extra signal so that yeet(ts) can be memoized and doesn't invalidate the next queue
        quote(yeet(ts)),
      ];
    }, version.rendered + dispatches);
  };

  return (
    reconcile(
      quote(
        gather(
          unquote(
            detach(use(Run), (run: Task) => {
              ref.run = run;
              // To avoid flashes, respond to outside updates immediately,
              // as they are usually a resize event.
              if (ref.version.request) cancelAnimationFrame(ref.version.request);
              render();
            })
          ),
          Resume,
        )
      )
    )
  );
}
