import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { ObjectTrait } from './types';
import { memo, provide, useOne } from '@use-gpu/live';
import { useMatrixContext, MatrixContext } from '@use-gpu/workbench';
import { mat4 } from 'gl-matrix';

import { useObjectTrait } from './traits';
import { composeTransform } from './lib/compose';

export type NodeProps = Partial<ObjectTrait> & {
  _?: number,
};

export const Node: LiveComponent<NodeProps> = (props: PropsWithChildren<NodeProps>) => {
  const parent = useMatrixContext();
  const {position: p, scale: s, quaternion: q, rotation: r, matrix: m} = useObjectTrait(props);
  const {children} = props;

  const combined = useOne(() => {
    const matrix = mat4.create();

    if (m) {
      mat4.copy(matrix, m);
      if (p || r || q || s) {
        const t = mat4.create();
        composeTransform(t, p, r, q, s);
        mat4.multiply(matrix, matrix, t);
      }
    }
    else if (p || r || q || s) {
      composeTransform(matrix, p, r, q, s);
    }

    if (parent) mat4.multiply(matrix, parent, matrix);

    return matrix;
  }, [p, s, q, r, m]);

  return provide(MatrixContext, combined, children);
};
