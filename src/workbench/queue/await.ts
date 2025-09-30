import type { LiveComponent, LiveElement } from '@use-gpu/live';

import { useAwait, useOne } from '@use-gpu/live';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AwaitProps<T> = {
  promise?: Promise<LiveElement>,
  all?: Promise<LiveElement>[],
};

/** Await one or many promises that return LiveElements. */
export const Await: LiveComponent<AwaitProps<unknown>> = <T>(props: AwaitProps<T>) => {
  const {all, promise} = props;

  const run = all
    ? () => Promise.all(all)
    : () => promise ?? Promise.resolve();

  const [value, error] = useAwait<LiveElement | undefined | void>(run, all ?? [promise]);
  useOne(() => error && console.error(error), error);

  return value;
}

