import { render } from '../live';
import { LiveElement } from '../live/types';

export type LiveProps = {
  children: LiveElement<any>,
};

export const Live: React.FC<LiveProps> = ({children}) => {
  render(children);
  return null;
};
