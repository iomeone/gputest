import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';
import type { GPUGeometry, StorageSource } from '@use-gpu/core';

import { use, useCallback, useOne, tagFunction } from '@use-gpu/live';
import { makeUseTrait, combine, TraitProps } from '@use-gpu/traits/live';

import {
  FaceLayer,
  InstanceData,
  UseInstance,
  IndexedTransform,
  useMatrixContext,
} from '@use-gpu/workbench';

import { ColorTrait, ObjectTrait } from './traits';
import { composeTransform } from './lib/compose';

import { mat3, mat4 } from 'gl-matrix';

const Traits = combine(ColorTrait, ObjectTrait);
const useTraits = makeUseTrait(Traits);

export type InstancesProps = PropsWithChildren<{
  mesh: GPUGeometry,
  shaded?: boolean,
  side?: 'front' | 'back' | 'both',
  format?: 'u16' | 'u32',
  render?: (Instance: LiveComponent<InstanceProps>) => LiveElement,
}>;

export type InstanceProps = TraitProps<typeof Traits>;

const INSTANCE_SCHEMA = {
   matrices:       {format: 'mat4x4<f32>', prop: 'matrix'},
   normalMatrices: {format: 'mat3x3<f32>', prop: 'normalMatrix'},
   colors:         {format: 'vec4<f32>',   prop: 'color'},
};

export const Instances: LiveComponent<InstancesProps> = (props: InstancesProps) => {
  const {
    mesh,
    shaded,
    side,
    format = 'u16',
    render,
  } = props;

  const Resume = useCallback((sources: Record<string, StorageSource>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {matrices, normalMatrices, ...rest} = sources;
    const instance = useCallback(() => matrices.length, [matrices]);
    return use(IndexedTransform, {
      ...sources,
      children: use(FaceLayer, {...rest, instance, mesh, shaded, side}),
    });
  }, [mesh]);

  return use(InstanceData, {
    format,
    schema: INSTANCE_SCHEMA,
    render: (useInstance: UseInstance) => {
      const Instance = useOne(() => makeInstancer(useInstance), useInstance);
      return render ? render(Instance as any) : null;
    },
    then: Resume,
  })
};

const makeInstancer = (
  useInstance: UseInstance,
) => tagFunction((props: Partial<InstanceProps>) => {
  const parent = useMatrixContext();
  const updateInstance = useInstance();

  const {color, position: p, scale: s, quaternion: q, rotation: r, matrix: m} = useTraits(props) as any;
  const ref = useOne(() => ({
    matrix: mat4.create(),
    normalMatrix: mat3.create(),
    composed: mat4.create(),
  }));

  useOne(() => {
    const {matrix, normalMatrix, composed} = ref;

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

    if (parent) mat4.multiply(matrix, parent, matrix);
    mat3.normalFromMat4(normalMatrix, matrix);

    updateInstance({matrix, normalMatrix, color});
  }, props);

  return null;
}, 'Instance');
