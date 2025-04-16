import type { LiveComponent, LiveElement, LiveNode, LiveFiber, Task, PropsWithChildren, ArrowFunction } from '@use-gpu/live';
import { use, detach, provide, unquote, yeet, gather, useCallback, useContext, useDouble, useFiberId, useOne, useResource, useState, tagFunction, incrementVersion } from '@use-gpu/live';

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
  decimate?: number,
  converge?: number,
}>;

export type LoopRef = {
  time: {
    timestamp: number,
    delta: number,
    elapsed: number,
    start: number,
  },
  version: {
    // Requested frame
    frame: number,
    // Rendered frame
    rendered: number,
    // Converge until frame #
    converge: number,
    // Animation frame requested
    pending: boolean,
    // Animation frame dispatched
    queued: boolean,
    // Animation frame handle
    request: number | null,
  },
  dispatch: {
    fibers: Set<LiveFiber<any>>,
    render?: (timestamp?: number) => void,
    renderChildren?: () => void,
  }
  loop: {
    request?: (fiber?: LiveFiber<any>) => TimeContextProps,
  },
  parentTime: TimeContextProps,
  children?: LiveNode,
};

/** Provides `useAnimationFrame` and clock to allow for controlled looping and animation. */
export const Loop: LiveComponent<LoopProps> = (props: LoopProps) => {
  const {live, decimate = 1, converge = 0, children} = props;

  const parentTime = useContext(TimeContext);
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
      converge: 0,
      pending: false,
      queued: false,
      request: null,
    },
    dispatch: {
      fibers: new Set(),
      render: () => {},
    },
    loop: {
      buffered: true,
      request: () => ref.time,
    },
    parentTime,
    children,
  }));

  ref.children = children;
  ref.parentTime = parentTime;
  ref.version.converge = ref.version.frame + converge;

  // Check for <Loop> nesting
  const isSync = !!parent.buffered;

  // Bump the frame version to tell the dispatcher an animation frame is in progress
  const requestImmediateRender = useCallback(() => {
    ref.version.frame = incrementVersion(ref.version.frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderAnimationFrame = useCallback((timestamp?: number) => ref.dispatch.render?.(timestamp), []);

  const fiberId = useFiberId();

  // Request animation frame wrapper
  // for looped component re-rendering.
  const render = useResource((dispose) => {
    const {time, loop, dispatch} = ref;
    const {fibers} = dispatch;
    DEBUG && console.log('--- Reinitialize loop', '#' + fiberId);

    let mounted = true;
    dispose(() => mounted = false);

    const request = (fiber?: LiveFiber<any>) => {
      DEBUG && !ref.version.pending && fiber && console.warn(
        '=> Animated fiber',
        fiber.id,
        '#' + fiberId,
      );

      if (fiber && !fibers.has(fiber)) fibers.add(fiber);
      ref.version.converge = ref.version.frame + converge;

      return enqueue();
    };

    const enqueue = () => {
      DEBUG && !ref.version.pending && console.warn(
        '=> Request animation frame',
        '@' + (+new Date() - START),
        '#' + fiberId
      );

      // Enqueue animated fiber for next frame
      if (!ref.version.pending) ref.version.request = requestAnimationFrame(renderAnimationFrame);
      ref.version.pending = true;

      // Ensure parent is also a sync animation frame
      if (!decimate) parent.request();

      return ref.time;
    };

    const resetIfIdle = () => {
      if (!ref.version.pending) {
        requestAnimationFrame(() => time.timestamp = -Infinity);
      }
    };

    const render = (timestamp?: number) => {
      ref.version.pending = false;
      ref.version.request = null;

      DEBUG && console.log('-- Dispatch loop', '#' + fiberId, '@', +new Date() - START);

      const skipFrame = decimate > 1 && (ref.version.frame % decimate) !== 0;
      requestImmediateRender();

      // Abort on unmount
      if (!mounted) {
        DEBUG && console.log('--- Unmounted');
        return;
      }

      // Skip
      if (skipFrame) {
        DEBUG && console.log('-- Skip frame', ref.version.frame);
        return request();
      }

      // Loop continuously if live
      if (live && mounted) request();

      // Continue if still converging
      else if (converge && ref.version.frame < ref.version.converge) enqueue();

      DEBUG && console.log('-- Timed', '#' + fiberId, '@', +new Date() - START, '>>', timestamp, time.delta);

      // Start elapsed timer once we have timing info
      if (timestamp == null && ref.parentTime.timestamp) {
        //true && console.log('-- Parent Frame', '#' + fiberId);
        timestamp = ref.parentTime.timestamp;
      }
      if (timestamp != null) {
        if (timestamp === time.timestamp && timestamp !== -Infinity) {
          // Avoid double render due to colliding animation frame + sync render
          return;
        }
        else if (timestamp - time.timestamp < 3) {
          // Check for variable frame rate shenanigans
          DEBUG && console.warn('Unreasonable frame interval detected < 3ms', '#' + fiberId);
          return request();
        }
        else {
          if (time.timestamp === -Infinity) time.start = timestamp;
          else time.delta = timestamp - time.timestamp;

          time.elapsed = timestamp - time.start;
          time.timestamp = timestamp;
        }
      }

      // Schedule enqueued fibers from last frame
      DEBUG && console.log('Animated fibers', fibers.size, '#' + fiberId)
      for (const fiber of fibers.values()) if (fiber.bound) {
        fiber.host?.schedule(fiber);
        if (fiber.version != null) fiber.version = incrementVersion(fiber.version);
      }
      fibers.clear();

      // Render detached children
      const {renderChildren} = ref.dispatch;
      if (renderChildren) renderChildren();

      // Check if animation stopped
      queueMicrotask(resetIfIdle);
    };

    loop.request = request;
    dispatch.render = render;

    return render;
  }, [live]);

  useRenderContext();
  usePerFrame();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const Run = useCallback(tagFunction(() => {
    const {time, children} = ref;

    const [signalSwap] = useDouble(signal);
    let view: LiveElement = useOne(() => provide(LoopContext, ref.loop, children), children);

    const t = {...time};
    view = [
      signalSwap(),
      provide(FrameContext, ref.version.frame,
        provide(TimeContext, t, view)
      )
    ];

    return view;
  }, 'Run'), []);

  // Intercept unscheduled renders
  // and ensure steady rendering
  // when children change.
  const Resume = (ts: ArrowFunction[]) => {
    DEBUG && console.log('Resume(Loop) rendered', '#' + fiberId);

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
      DEBUG && console.log('Dispatch sync render', '#' + fiberId);
    }
    // Outside animation frame - async
    else if (!version.queued) {
      ref.version.queued = true;

      const {rendered} = version;
      DEBUG && console.log('Schedule async render', '#' + fiberId);
      requestAnimationFrame(() => {
        // If no new calls rendered since last frame, dispatch existing queue
        if (rendered === version.rendered) {
          setDispatches(d => d + 1);
          DEBUG && console.log('Dispatch async render', '#' + fiberId);
        }
        // Otherwise loop did fire
        else DEBUG && console.log('Skip async render', '#' + fiberId);
      });
    }

    return useOne(() => {
      DEBUG && console.log('Dispatch to queue', '#' + fiberId);
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
            detach(use(Run), (renderChildren: Task) => {
              ref.dispatch.renderChildren = renderChildren;
              // To avoid flashes, respond to outside updates immediately,
              // as they are usually a resize event.
              if (ref.version.pending) {
                if (ref.version.request != null) cancelAnimationFrame(ref.version.request);
                ref.version.pending = false;
              }
              DEBUG && console.log('Sync render', '#' + fiberId);
              render();
            })
          ),
          Resume,
        )
      )
    )
  );
}
