import type { LiveComponent } from '@use-gpu/live';
import type { LightKindProps } from './light';

import { use, yeet, useCallback, useMemo, useOne, useRef } from '@use-gpu/live';
import { alignSizeTo, uploadBuffer } from '@use-gpu/core';

import { useBufferedSize } from '../../hooks/useBufferedSize';
import { useShader } from '../../hooks/useShader';
import { useRawSource } from '../../hooks/useRawSource';

import { useDeviceContext } from '../../providers/device-provider';
import { useViewContext } from '../../providers/view-provider';

import { makeSphereGeometry } from '../../primitives/geometry/sphere';
import { forMeshTriangles } from '../../primitives/geometry/util';

import { getDeferredLightVertex } from '@use-gpu/wgsl/instance/vertex/deferred-light.wgsl';
import { getDeferredLightFragment } from '@use-gpu/wgsl/instance/fragment/deferred-light.wgsl';

import { vec3 } from 'gl-matrix';

import {
  GEOMETRY_PIPELINE, GEOMETRY_DEFS,
  FULLSCREEN_PIPELINE, FULLSCREEN_DEFS,
  FULLSCREEN_STENCIL_PIPELINE, GEOMETRY_STENCIL_PIPELINE, STENCIL_PIPELINE,
  LightDraw,
} from './light';

export const PointLightRender: LiveComponent<LightKindProps> = (props: LightKindProps) => {
  const {
    lights,
    order,
    start,
    end,
    gbuffer,
    stencil,

    getLight,
    applyLight,
  } = props;

  const device = useDeviceContext();
  const {cull, uniforms: viewUniforms} = useViewContext();

  const sphere = useOne(() => makeSphereGeometry({ width: 2, detail: [6, 12] }));
  const getScale = useOne(() => {
    let l = Infinity;
    forMeshTriangles(sphere, (a: vec3, b: vec3, c: vec3) => {
      vec3.add(a, a, b);
      vec3.add(a, a, c);
      vec3.scale(a, a, 1/3);
      l = Math.min(l, vec3.length(a));
    });
    return 1 / l;
  });

  const getPosition = useRawSource(sphere.attributes.positions, 'vec4<f32>');
  const getIndex = useRawSource(sphere.attributes.indices, 'u16');

  const size = useBufferedSize(alignSizeTo(end - start, 2));
  const instances = useOne(() => new Uint16Array(size), size);
  const outsides = useOne(() => new Uint16Array(size), size);
  const insides = useOne(() => new Uint16Array(size), size);

  const getInstance = useRawSource(instances, 'u16');
  const getOutside = useRawSource(outsides, 'u16');
  const getInside = useRawSource(insides, 'u16');

  const getInstanceVertex = useShader(getDeferredLightVertex, [getLight, getInstance, getPosition, getIndex, getScale], GEOMETRY_DEFS);
  const getOutsideVertex  = useShader(getDeferredLightVertex, [getLight, getOutside, getPosition, getIndex, getScale], GEOMETRY_DEFS);
  const getInsideVertex   = useShader(getDeferredLightVertex, [getLight, getInside,  getPosition, getIndex], FULLSCREEN_DEFS);

  const getFragment = useShader(getDeferredLightFragment, [...gbuffer, getLight, applyLight]);

  const stencilLinks = useMemo(() => ({getVertex: getInstanceVertex}), [getInstanceVertex, getFragment]);
  const outsideLinks = useMemo(() => ({getVertex: getOutsideVertex, getFragment}), [getOutsideVertex, getFragment]);
  const insideLinks  = useMemo(() => ({getVertex: getInsideVertex,  getFragment}), [getInsideVertex,  getFragment]);

  const instanceCountRef = useRef(0);
  const outsideCountRef = useRef(0);
  const insideCountRef = useRef(0);

  const onDispatch = useCallback(() => {
    const {viewPosition: {current: viewPosition}} = viewUniforms;
    const v3 = vec3.create();

    let instanceCount = 0;
    let outsideCount = 0;
    let insideCount = 0;

    for (let i = start; i < end; ++i) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const light = lights.get(order[i])!;
      const {position, intensity, cutoff} = light;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const radius = Math.sqrt(intensity! * 3.1415 / (cutoff || 1)) * getScale;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (cull(position!, radius)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        vec3.sub(v3, position! as vec3, viewPosition as vec3);

        instances[instanceCount++] = i;
        if (vec3.length(v3) > radius) outsides[outsideCount++] = i;
        else insides[insideCount++] = i;
      }
    }

    instanceCountRef.current = instanceCount;
    outsideCountRef.current = outsideCount;
    insideCountRef.current = insideCount;

    uploadBuffer(device, getInstance.buffer, instances.buffer);
    uploadBuffer(device, getOutside.buffer, outsides.buffer);
    uploadBuffer(device, getInside.buffer, insides.buffer);
  }, [lights, getInstance, getOutside, getInside, instances, outsides, insides]);

  return [
    yeet({'dispatch': onDispatch}),
    stencil ? use(LightDraw, sphere.count, instanceCountRef, 0, stencilLinks, STENCIL_PIPELINE, 'stencil') : null,
    use(LightDraw,
      sphere.count, outsideCountRef, 0, outsideLinks,
      stencil ? GEOMETRY_STENCIL_PIPELINE : GEOMETRY_PIPELINE),
    use(LightDraw, 3, insideCountRef, 0, insideLinks,
      stencil ? FULLSCREEN_STENCIL_PIPELINE : FULLSCREEN_PIPELINE),
  ];
}
