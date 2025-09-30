import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import { TraitProps } from '@use-gpu/traits';
import { provide, useDouble, useMemo, useOne } from '@use-gpu/live';
import { useMatrixContext, MatrixContext } from '@use-gpu/workbench';
import { mat4 } from 'gl-matrix';

import { ObjectTrait, useObjectTrait } from './traits';
import { composeTransform } from './lib/compose';

const makeMat4 = () => mat4.create();

export type NodeProps = PropsWithChildren<TraitProps<typeof ObjectTrait>>;

export const Node: LiveComponent<NodeProps> = (props: NodeProps) => {
  const parent = useMatrixContext();
  const {position: p, scale: s, quaternion: q, rotation: r, matrix: m} = useObjectTrait(props) as any;
  const {children} = props;

  const [swapMatrix] = useDouble(makeMat4);
  const composed = useOne(makeMat4);

  const combined = useMemo(() => {
    const matrix = swapMatrix();

    if (m) {
      mat4.copy(matrix, m);
      if (p || r || q || s) {
        composeTransform(composed, p, r, q, s);
        mat4.multiply(matrix, matrix, composed);
      }
    }
    else if (p || r || q || s) {
      composeTransform(matrix, p, r, q, s);
    }
    else {
      mat4.identity(matrix);
    }

    if (parent) mat4.multiply(matrix, parent, matrix);

    return matrix;
  }, [p, s, q, r, m]);

  return provide(MatrixContext, combined, children);
};
