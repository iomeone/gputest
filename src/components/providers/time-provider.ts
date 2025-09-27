import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { provide, makeContext, useContext } from '@use-gpu/live';

/*
export type TimeProviderProps = {
  timestamp?: number,
  delta?: number,
  version?: number,

  render?: (t: TimeContextProps) => LiveElement<any>,
  children?: LiveElement<any>
};
*/

export type TimeContextProps = {
  timestamp?: number,
  elapsed?: number,
  delta?: number,
};

export const TimeContext = makeContext<TimeContextProps>({
  timestamp: 0,
  elapsed: 0,
  delta: 0,
}, 'TimeContext');

export const useTimeContext = () => useContext<TimeContextProps>(TimeContext);

/*
export const TimeProvider: LiveComponent<TimeProviderProps> = (props: TimeProviderProps) => {
  const {
    timestamp = +new Date(),
    delta,
    version = 0,

    render,
    children,
  } = props;

  const timeRef = useOne(() => ({
    start: timestamp,
    last: timestamp,
  }), version);

  const elapsed = timestamp - timeRef.start; 
  timeRef.last = timestamp;

  const context = {
    timestamp,
    elapsed,
    delta,
  };
  
  return provide(TimeContext, context, (render ? render(context) : children) ?? []);
};
*/