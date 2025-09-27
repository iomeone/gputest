import { LiveComponent } from '../../live/types';
import { use } from '../../live';

import { Draw, Pass } from '../../components';

export type EmptyPageProps = {
  _unused?: boolean,
};

export const EmptyPage: LiveComponent<EmptyPageProps> = (props) => {

  return (
    use(Draw, {
      children: use(Pass, {}),
    })
  );
};
