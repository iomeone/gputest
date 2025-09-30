import type { LiveComponent, PropsWithChildren } from '@use-gpu/live';
import type { GPUGeometry } from '@use-gpu/core';

import { memo, use, wrap } from '@use-gpu/live';

import { FaceLayer } from '@use-gpu/workbench';

import { Primitive } from './primitive';

export type MeshProps = PropsWithChildren<{
  id?: number,
  mesh: GPUGeometry,
  shaded?: boolean,
  side?: 'front' | 'back' | 'both',
  mode?: string,
}>;

export const Mesh: LiveComponent<MeshProps> = memo((props: MeshProps) => {
  return (
    wrap(Primitive,
      use(FaceLayer, props)
    )
  );
}, 'Mesh');
