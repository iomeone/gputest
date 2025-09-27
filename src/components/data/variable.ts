import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { incrementVersion, useState, useResource, useNoResource } from '@use=gpu/live';

export type VariableProps = {
  value?: number,
  min?: number,
  max?: number,

  animate?: boolean,
  repeat?: boolean,
  mirror?: boolean,
  duration?: number,

  render?: (x: number) => LiveElement<any>,
};

export const Variable: LiveComponent<CartesianProps> = (props) => {
  const {
    value: initial,
    min,
    max,

    animate = false,
    repeat = 0,
    mirror = false,
    duration = 1,
    ease = 'cosine',
    
    render,
  } = props;
  
  const [value, setValue] = useState<number>(initial);

  if (animate) {
    useResource((dispose) => {
      let start = 0;
      let running = true;

      const loop = () => {
        let t = time;

        const end = duration * repeat;
        if (t > end) {
          running = false;
          t = end;
        }

        if (mirror) {
          const double = t % (duration * 2);
          if (double > duration) t = duration * 2 - double;
        }

        setTime(t);
        if (running) requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
      dispose(() => { running = false; });
    })
  }
  else {
    useNoResource();
  }

  return render ? render()
}