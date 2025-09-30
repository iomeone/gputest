import type { LiveComponent, LiveElement } from '../live';
import type { DataSchema, GPUGeometry, StorageSource } from '../core';

import { use, useCallback, useOne, useVersion, tagFunction } from '../live';
import { makeUseTrait, combine, TraitProps } from '../traits/index-live';

import {
  FaceLayer,
  InstanceData,
  UseInstance,
  IndexedTransform,
  useMatrixContext,
  getRenderFunc,
  PipelineOptions,
} from '../workbench';

import { ColorTrait, LookupTrait, ObjectTrait } from './traits';
import { composeTransform } from './lib/compose';

import { mat3, mat4, vec4 } from 'gl-matrix';

const Traits = combine(ColorTrait, LookupTrait, ObjectTrait);
const useTraits = makeUseTrait(Traits);

export type InstancesFlags = Pick<Partial<PipelineOptions>, 'mode' | 'depthTest' | 'depthWrite' | 'alphaToCoverage' | 'alphaToDiscard' | 'blend'>;

export type InstancesProps = InstancesFlags & {
  mesh: GPUGeometry,
  schema?: DataSchema,

  shaded?: boolean,
  side?: 'front' | 'back' | 'both',
  format?: 'u16' | 'u32',

  id?: number,

  render?: (Instance: LiveComponent<InstanceProps>) => LiveElement,
  children?: (Instance: LiveComponent<InstanceProps>) => LiveElement,
};

export type InstanceProps = TraitProps<typeof Traits>;

const INSTANCE_SCHEMA = {
  matrices:       {format: 'mat4x4<f32>', prop: 'matrix'},
  normalMatrices: {format: 'mat3x3<f32>', prop: 'normalMatrix'},
  colors:         {format: 'vec4<f32>',   prop: 'color'},
};

const INSTANCE_SCHEMA_ID = {
  ...INSTANCE_SCHEMA,
  lookups:        {format: 'u32',         prop: 'lookup'},
};

export const Instances: LiveComponent<InstancesProps> = (props: InstancesProps) => {
  const {
    id,

    mesh,
    shaded,
    side,
    schema = id ? INSTANCE_SCHEMA_ID : INSTANCE_SCHEMA,
    format = 'u16',

    mode,
    depthTest,
    depthWrite,
    alphaToCoverage,
    alphaToDiscard,
    blend,
  } = props;

  const render = getRenderFunc(props);

  const Resume = useCallback((sources: Record<string, StorageSource>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {matrices, normalMatrices, ...rest} = sources;
    const instance = useCallback(() => matrices.length, [matrices]);
    return use(IndexedTransform, {
      ...sources,
      children: use(FaceLayer, {
        ...rest,

        instance,
        mesh,
        shaded,
        side,

        id,
        mode,
        depthTest,
        depthWrite,
        alphaToCoverage,
        alphaToDiscard,
        blend,
      }),
    });
  }, [mesh, shaded, side, id, mode, depthTest, depthWrite, alphaToCoverage, alphaToDiscard, blend]);

  return use(InstanceData, {
    format,
    schema,
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

  const {color, position: p, scale: s, quaternion: q, rotation: r, matrix: m, lookup} = useTraits(props) as any;
  const ref = useOne(() => ({
    matrix: mat4.create(),
    normalMatrix: mat3.create(),
    color: vec4.create(),
    lookup: 0,
  }));

  const v = useVersion(props) + useVersion(parent) + useVersion(lookup);
  useOne(() => {
    const {matrix, normalMatrix} = ref;

    if (p || r || q || s) {
      composeTransform(matrix, p, r, q, s, m);
    }
    else if (m) {
      mat4.copy(matrix, m);
    }
    else {
      mat4.identity(matrix);
    }

    if (parent) mat4.multiply(matrix, parent, matrix);
    mat3.normalFromMat4(normalMatrix, matrix);

    ref.color = color;
    ref.lookup = lookup;
    updateInstance(ref);
  }, v);

  return null;
}, 'Instance');
