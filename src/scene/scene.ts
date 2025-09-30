import type { LiveComponent, PropsWithChildren } from '../live';

import { provide } from '../live';
import { useMatrixContext, useNoMatrixContext, MatrixContext } from '../workbench';

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
