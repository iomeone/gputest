import type { LiveComponent, PropsWithChildren } from '../live';
import type { GPUGeometry } from '../core';

import { memo, use, wrap } from '../live';

import { FaceLayer, FaceLayerFlags } from '../workbench';

import { Primitive } from './primitive';

export type MeshProps = PropsWithChildren<{
  id?: number,
  mesh: GPUGeometry,
}> & FaceLayerFlags;

export const Mesh: LiveComponent<MeshProps> = memo((props: MeshProps) => {
  return (
    wrap(Primitive,
      use(FaceLayer, props)
    )
  );
}, 'Mesh');
