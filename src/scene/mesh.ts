import type { LiveComponent, PropsWithChildren } from '../live';
import type { ShaderSource } from '../shader';
import type { ObjectTrait } from './types';
import { memo, use, wrap, useOne } from '../live';

import { FaceLayer } from '../workbench';

import { Primitive } from './primitive';

export type MeshProps = {
  id?: number,
  mesh: Record<string, ShaderSource>,
  shaded?: boolean,
  side?: 'front' | 'back' | 'both',
};

export const Mesh: LiveComponent<MeshProps> = memo((props: PropsWithChildren<MeshProps>) => {
  const {
    mesh,
    ...rest
  } = props;

  return (
    wrap(Primitive,
      use(FaceLayer, {...rest, ...mesh})
    )
  );
}, 'Mesh');
