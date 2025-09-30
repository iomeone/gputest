import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';

import { provide } from '@use-gpu/live';
import { useMatrixContext, useNoMatrixContext, MatrixContext } from '@use-gpu/workbench';

export type SceneProps = PropsWithChildren<{
  inherit?: boolean,
}>;

export const Scene: LiveComponent<SceneProps> = (props: SceneProps) => {
  const {
    inherit = false,
    children,
  } = props;

  const parent = inherit ? useMatrixContext() : useNoMatrixContext();
  return provide(MatrixContext, parent, children);
};
