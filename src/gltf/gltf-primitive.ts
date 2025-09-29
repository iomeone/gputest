import type { LC, LiveElement } from '@use-gpu/live';
import type { UniformAttribute, DataBounds } from '@use-gpu/core';
import type { GLTF, GLTFPrimitiveData } from './types';

import { flattenIndexedArray } from '@use-gpu/core';
import { bundleToAttributes } from '@use-gpu/shader/wgsl';
import { use, provide, useCallback, useOne, useNoOne, useMemo, useNoMemo, useVersion, useNoCallback, useNoVersion } from '@use-gpu/live';
import { generateTangents } from 'mikktspace';
import { vec3, mat3, mat4 } from 'gl-matrix';

import {
  FaceLayer, FaceLayerProps,
  PBRMaterial,
  TransformContext,
  useBoundSource, useNoBoundSource,
  useBoundShader, useNoBoundShader,
  useRawSource, useNoRawSource,
  useShaderRef, useNoShaderRef,
} from '@use-gpu/workbench';
import { getCartesianPosition } from '@use-gpu/wgsl/transform/cartesian.wgsl'
import { getMatrixDifferential } from '@use-gpu/wgsl/transform/diff-matrix.wgsl'
import { useGLTFMaterial } from './gltf-material';

const MATRIX_BINDINGS = bundleToAttributes(getCartesianPosition);

export type GLTFPrimitiveProps = {
  gltf: GLTF,
  primitive: GLTFPrimitiveData,

  transform?: mat4,
};

export const GLTFPrimitive: LC<GLTFPrimitiveProps> = (props) => {
  const {
    gltf,
    primitive,
    transform,
  } = props;
  if (!gltf.bound) throw new Error("GLTF bound data is missing. Load GLTF using <GLTFData>.");

  const {bound: {storage}} = gltf;
  const {attributes, indices, material, mode} = primitive;
  const {POSITION, NORMAL, TANGENT, TEXCOORD_0} = attributes;

  const pbrMaterial = useGLTFMaterial(gltf, material);  

  const faces: Partial<FaceLayerProps> = {
    shaded: true,
    color: [1, 1, 1, 1],
    unweldedTangents: true,
    side: pbrMaterial.doubleSided ? 'both' : 'front',
  };

  if (POSITION   != null) faces.positions = storage[POSITION];
  if (NORMAL     != null) faces.normals   = storage[NORMAL];
  if (TANGENT    != null) faces.tangents  = storage[TANGENT];
  if (TEXCOORD_0 != null) faces.uvs       = storage[TEXCOORD_0];
  if (indices    != null) faces.indices   = storage[indices];

  // Generate mikkTSpace tangents
  if (faces.positions && faces.normals && faces.uvs && !faces.tangents) {
    let ps = gltf.bound.data[POSITION];
    let ns = gltf.bound.data[NORMAL];
    let ts = gltf.bound.data[TEXCOORD_0];

    const tangents = useMemo(() => {
      if (indices != null) {
        // Unweld mesh
        const inds = gltf.bound?.data?.[indices] as any;
        if (inds) {
          ps = flattenIndexedArray(ps as any, inds, 3);
          ns = flattenIndexedArray(ns as any, inds, 3);
          ts = flattenIndexedArray(ts as any, inds, 2);
        }
      }

      const out = generateTangents(ps as any, ns as any, ts as any);
      const n = out.length;
      for (let i = 0; i < n; i += 4) out[i + 3] *= -1;
      return out;
    }, [ps, ns, ts]);

    faces.tangents = useRawSource(tangents, 'vec4<f32>');
  }
  else {
    useNoMemo();
    useNoRawSource();
  }

  const render = use(FaceLayer, faces);

  let view: LiveElement = render;
  if (transform) {
    const [normalMatrix, matrixScale] = useOne(() => {
      const normalMatrix = mat3.normalFromMat4(mat3.create(), transform);

      const s = mat4.getScaling(vec3.create(), transform);
      const matrixScale = Math.max(Math.abs(s[0]), Math.abs(s[1]), Math.abs(s[2]));

      return [normalMatrix, matrixScale];
    }, transform);

    const t = useShaderRef(transform);
    const c = useShaderRef(normalMatrix);
    const s = useShaderRef(matrixScale);

    // Apply matrix transform
    // (share uniform between both functions)
    const m     = useBoundSource(MATRIX_BINDINGS[0], t);
    const xform = useBoundShader(getCartesianPosition, [m]);
    const dform = useBoundShader(getMatrixDifferential, [m, c]);

    const cullBounds = useOne(() => ({ center: [], radius: 0, min: [], max: [] } as DataBounds));
    const getBounds = useCallback((bounds: DataBounds) => {
      vec3.transformMat4(cullBounds.center as any, bounds.center as any, (t as any).current);
      cullBounds.radius = (s as any).current * bounds.radius;
      return cullBounds;
    });

    const context = useOne(() => ({transform: xform, differential: dform, bounds: getBounds}));

    view = provide(TransformContext, context, view);
  }
  else {
    useNoOne();
    useNoShaderRef();
    useNoShaderRef();
    useNoShaderRef();
    useNoBoundShader();
    useNoBoundShader();
    useNoOne();
    useNoCallback();
    useNoOne();
  }

  return (
    use(PBRMaterial, {...pbrMaterial, children: view})
  );
};
