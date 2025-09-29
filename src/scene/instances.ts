import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';
import type { StorageSource } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';
import type { ObjectTrait } from './types';

import { use, memo, provide, yeet, useCallback, useMemo, useOne, tagFunction } from '@use-gpu/live';
import { bindEntryPoint } from '@use-gpu/shader/wgsl';

import {
  FaceLayer,
  InstanceData,
  TransformContext,
  MatrixContext,
  useMatrixContext,
  useCombinedTransform,
  getBoundShader,
} from '@use-gpu/workbench';

import { useObjectTrait } from './traits';
import { composeTransform } from './lib/compose';

import { loadInstance } from '@use-gpu/wgsl/transform/instance.wgsl';
import { getCartesianPosition } from '@use-gpu/wgsl/transform/cartesian.wgsl';
import { getMatrixDifferential } from '@use-gpu/wgsl/transform/diff-matrix.wgsl';

import { mat3, mat4 } from 'gl-matrix';

export type InstancesProps = {
  mesh: Record<string, ShaderSource>,
  shaded?: boolean,
  side?: 'front' | 'back' | 'both',
  format?: 'u16' | 'u32',
  render?: (Instance: LiveComponent<InstanceProps>) => LiveElement,
};

export type InstanceProps = Partial<ObjectTrait>;

const INSTANCE_FIELDS = [
  ['mat4x4<f32>', 'matrix'],
  ['mat3x3<f32>', 'normalMatrix'],
];

export const Instances: LiveComponent<InstancesProps> = (props: PropsWithChildren<InstancesProps>) => {
  const {
    mesh,
    shaded,
    side,
    format,
    render,
  } = props;

  const Resume = useCallback((instances: StorageSource, fieldSources: StorageSource[]) => {
    
    const [view, boundPosition, boundDifferential] = useMemo(() => {

      const [matrices, normalMatrices] = fieldSources;

      const load = getBoundShader(loadInstance, [matrices, normalMatrices]);
      const matrix = bindEntryPoint(load, 'getTransformMatrix');
      const normalMatrix = bindEntryPoint(load, 'getNormalMatrix');

      const boundPosition = getBoundShader(getCartesianPosition, [matrix]);
      const boundDifferential = getBoundShader(getMatrixDifferential, [matrix, normalMatrix]);

      const view = use(FaceLayer, {...mesh, instances, load, shaded, side});
      return [view, boundPosition, boundDifferential];
    }, [instances, fieldSources]);

    const context = useCombinedTransform(boundPosition, boundDifferential);

    return (
      provide(TransformContext, context, view)
    );
  }, [mesh]);

  return use(InstanceData, {
    format,
    fields: INSTANCE_FIELDS,
    render: (useInstance: () => (data: Record<string, any>) => void) => {
      const Instance = useOne(() => makeInstance(useInstance), useInstance);
      return render ? render(Instance as any) : null;
    },
    then: Resume,
  })
};

const makeInstance = (
  useInstance: () => (data: Record<string, any>) => void,
) => tagFunction((props: Partial<ObjectTrait>) => {
  const parent = useMatrixContext();
  const updateInstance = useInstance();

  const {position: p, scale: s, quaternion: q, rotation: r, matrix: m} = useObjectTrait(props);
  const [matrix, normalMatrix] = useOne(() => [
    mat4.create(),
    mat3.create(),
  ]);

  useOne(() => {
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
    mat3.normalFromMat4(normalMatrix, matrix);

    updateInstance({matrix, normalMatrix});
  }, props);

  return null;
}, 'Instance');
