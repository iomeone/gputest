import { render } from '@use-gpu/live';
import { LiveElement } from '@use-gpu/live/types';

export type LiveProps = {
  children: LiveElement<any>,
};

export const Live: React.FC<LiveProps> = ({children}) => {
  render(children);
  return null;
};
