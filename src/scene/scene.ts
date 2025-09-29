import type { LiveComponent, PropsWithChildren } from '../live';
import type { ObjectTrait } from './types';

import { memo, provide, useOne } from '../live';
import { useMatrixContext, useNoMatrixContext, MatrixContext } from '../workbench';

import { mat4 } from 'gl-matrix';

export type SceneProps = {
  inherit?: boolean,
};

export const Scene: LiveComponent<SceneProps> = (props: PropsWithChildren<SceneProps>) => {
  const {
    inherit = false,
    children,
  } = props;

  const parent = inherit ? useMatrixContext() : useNoMatrixContext();
  return provide(MatrixContext, parent, children);
};
