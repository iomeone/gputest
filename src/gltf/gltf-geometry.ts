import type { TypedArray, UniformType } from '@use-gpu/core';
import type { GLTF, GLTFPrimitiveData } from './types';

import { toUnweldedArray, formatToArchetype, UNIFORM_ARRAY_DIMS } from '@use-gpu/core';
import { useMemo } from '@use-gpu/live';
import { patch, $nop } from '@use-gpu/state';
import { transformPositions, transformNormals } from '@use-gpu/workbench';
import { generateTangents } from 'mikktspace';
import { mat4 } from 'gl-matrix';

export const useGLTFGeometry = (
  gltf: GLTF,
  primitive: GLTFPrimitiveData,

  transform?: mat4,
) => {
  const {data: {arrays, formats: fmts}, materials} = gltf;
  const {
    attributes: {POSITION, NORMAL, TANGENT, TEXCOORD_0},
    indices,
    material,
  } = primitive;

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const side = materials?.[material!]?.doubleSided ? 'both' : 'front';

  const geometry = useMemo(() => {
    const attributes: Record<string, TypedArray> = {};
    const formats: Record<string, UniformType> = {};

    if (POSITION   != null) {
      attributes.positions = arrays[POSITION];
      formats.positions    = fmts[POSITION];
    }
    if (NORMAL     != null) {
      attributes.normals   = arrays[NORMAL];
      formats.normals      = fmts[NORMAL];
    }
    if (TANGENT    != null) {
      attributes.tangents  = arrays[TANGENT];
      formats.tangents     = fmts[TANGENT];
    }
    if (TEXCOORD_0 != null) {
      attributes.uvs       = arrays[TEXCOORD_0];
      formats.uvs          = fmts[TEXCOORD_0];
    }
    if (indices    != null) {
      attributes.indices   = arrays[indices];
      formats.indices      = fmts[indices];
    }

    // Generate mikkTSpace tangents
    if (TANGENT != null && (attributes.positions && attributes.normals && attributes.uvs && !attributes.tangents)) {
      let ps = arrays[POSITION];
      let ns = arrays[NORMAL];
      let ts = arrays[TEXCOORD_0];

      if (indices != null) {
        // Unweld mesh
        const inds = arrays[indices] as any;
        if (inds) {
          ps = toUnweldedArray(ps as any, inds, 3);
          ns = toUnweldedArray(ns as any, inds, 3);
          ts = toUnweldedArray(ts as any, inds, 2);
        }
      }

      const tangents = generateTangents(ps as any, ns as any, ts as any);
      const n = tangents.length;
      for (let i = 0; i < n; i += 4) tangents[i + 3] *= -1;

      attributes.tangents = tangents;
      formats.tangents = 'vec4<f32>';
    }

    const unwelded = formats.tangents ? {tangents: true} : undefined;
    const dims = Math.floor((UNIFORM_ARRAY_DIMS as any)[formats.positions]) || 1;
    return {
      count: attributes.indices?.length ?? (attributes.positions.length / dims),
      attributes,
      formats,
      archetype: formatToArchetype(formats, unwelded),
      unwelded,
      side,
    };
  }, [gltf, primitive]);

  const transformed = useMemo(() => {
    if (!transform) return geometry;

    const {attributes: {positions, normals, tangents}, formats} = geometry;

    const ps = positions ? transformPositions(positions, formats.positions, transform) : $nop();
    const ns = normals ? transformNormals(normals, formats.normals, transform) : $nop();
    const ts = tangents ? transformNormals(tangents, formats.tangents, transform) : $nop();

    return patch(geometry, {
      attributes: {positions: ps, normals: ns, tangents: ts},
      formats: {positions: 'vec4<f32>', normals: 'vec4<f32>', tangents: 'vec4<f32>'}
    });
  }, [geometry]);

  return transformed;
};
