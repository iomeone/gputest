import type { LiveComponent } from '../../live';
import { use } from '../../live';

import { Pass } from '../../workbench';

export type EmptyPageProps = {
  _unused?: boolean,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const EmptyPage: LiveComponent<EmptyPageProps> = (_: EmptyPageProps) => {
  return use(Pass, {});
};
