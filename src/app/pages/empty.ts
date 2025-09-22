import { LiveComponent } from '@use-gpu/live/types';
import { use } from '@use-gpu/live';

import { Draw, Pass } from '@use-gpu/components';

export type EmptyPageProps = {
  _unused?: boolean,
};

export const EmptyPage: LiveComponent<EmptyPageProps> = (props) => {

  return (
    use(Draw)({
      children: use(Pass)({}),
    })
  );
};
