import type { LC, LiveElement } from '@use-gpu/live';
import type { GLTF, GLTFPrimitiveData } from './types';

import { toUnweldedArray } from '@use-gpu/core';
import { use, provide, useMemo, useNoMemo } from '@use-gpu/live';
import { generateTangents } from 'mikktspace';
import { mat4 } from 'gl-matrix';

import {
  FaceLayer, FaceLayerProps,
  PBRMaterial,
  TransformContext,
  useCombinedMatrixTransform, useNoCombinedMatrixTransform,
  useRawSource, useNoRawSource,
} from '@use-gpu/workbench';
import { useGLTFMaterial } from './gltf-material';

export type GLTFPrimitiveProps = {
  gltf: GLTF,
  primitive: GLTFPrimitiveData,

  transform?: mat4,
};

export const GLTFPrimitive: LC<GLTFPrimitiveProps> = (props) => {
  const {
    gltf,
    primitive,
    transform: matrix,
  } = props;
  if (!gltf.bound) throw new Error("GLTF bound data is missing. Load GLTF using <GLTFData unbound={false}>.");

  const {data: {arrays}, bound: {storage}} = gltf;
  const {
    attributes: {POSITION, NORMAL, TANGENT, TEXCOORD_0},
    indices,
    material,
  } = primitive;

  const pbrMaterial = useGLTFMaterial(gltf, material);

  const faces: Partial<FaceLayerProps> = {
    flat: NORMAL == null,
    shaded: true,
    color: [1, 1, 1, 1],
    unwelded: {tangents: true},
    side: pbrMaterial.doubleSided ? 'both' : 'front',
  };

  if (POSITION   != null) faces.positions = storage[POSITION];
  if (NORMAL     != null) faces.normals   = storage[NORMAL];
  if (TANGENT    != null) faces.tangents  = storage[TANGENT];
  if (TEXCOORD_0 != null) faces.uvs       = storage[TEXCOORD_0];
  if (indices    != null) faces.indices   = storage[indices];

  // Generate mikkTSpace tangents
  if (TANGENT != null && (faces.positions && faces.normals && faces.uvs && !faces.tangents)) {
    let ps = arrays[POSITION];
    let ns = arrays[NORMAL];
    let ts = arrays[TEXCOORD_0];

    const tangents = useMemo(() => {
      if (indices != null) {
        // Unweld mesh
        const inds = arrays[indices];
        if (inds) {
          ps = toUnweldedArray(ps as any, inds, 3);
          ns = toUnweldedArray(ns as any, inds, 3);
          ts = toUnweldedArray(ts as any, inds, 2);
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

  const render = use(PBRMaterial, {...pbrMaterial, children: use(FaceLayer, faces)});

  let view: LiveElement = render;
  if (matrix) {
    const [context] = useCombinedMatrixTransform(matrix);

    view = provide(TransformContext, context, view);
  }
  else {
    useNoCombinedMatrixTransform();
  }

  return view;
};
