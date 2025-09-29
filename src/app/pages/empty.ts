import type { LiveComponent } from '../../live';
import { use } from '../../live';

import { Pass } from '../../workbench';

export type EmptyPageProps = {
  _unused?: boolean,
};

export const EmptyPage: LiveComponent<EmptyPageProps> = (props) => {
  return use(Pass, {});
};
