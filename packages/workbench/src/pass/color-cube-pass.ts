import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { LightEnv, Renderable } from './types';
import { mat4 } from 'gl-matrix';

import { yeet, memo, useMemo, useOne } from '@use-gpu/live';
import { makeGlobalUniforms, getCubeFaceMatrix, makeViewUniforms, reverseZ, seq, updateViewUniforms, uploadBuffer, VIEW_UNIFORMS } from '@use-gpu/core';

import { useRenderContext } from '../providers/render-provider';
import { useDeviceContext } from '../providers/device-provider';
import { useViewContext } from '../providers/view-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useFrustumCuller } from '../hooks/useFrustumCuller';
import { useInspectable } from '../hooks/useInspectable'

import { getRenderPassDescriptor, drawToPass } from './util';

const {quote} = QueueReconciler;

export type ColorCubePassProps = PropsWithChildren<{
  env: {
    light?: LightEnv,
  },
  calls: {
    opaque?: Renderable[],
    transparent?: Renderable[],
    debug?: Renderable[],
  },
  overlay?: boolean,
  merge?: boolean,
}>;

const label = '<ColorCubePass>';
const LABEL = { label };
const τ = Math.PI * 2;

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

/** Color cube render pass.

Draws all opaque calls, then all transparent calls, then all debug wireframes.
*/
export const ColorCubePass: LC<ColorCubePassProps> = memo((props: ColorCubePassProps) => {
  const {
    overlay = false,
    merge = false,
    calls,
    env: {light},
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();
  const renderContext = useRenderContext();
  const {uniforms: viewUniforms} = useViewContext();
  const {bind: makeBindPass} = usePassContext();

  const opaques      = toArray(calls['opaque']      as Renderable[]);
  const transparents = toArray(calls['transparent'] as Renderable[]);
  const debugs       = toArray(calls['debug']       as Renderable[]);

  // Global view bound dynamically to cube face
  const binding = useMemo(() =>
    makeGlobalUniforms(device, [VIEW_UNIFORMS]),
    [device]);
  const {bindGroup, buffer, pipe} = binding;

  const uniforms = useOne(makeViewUniforms);

  const {viewPosition, projectionViewFrustum} = uniforms;
  const cull = useFrustumCuller(viewPosition, projectionViewFrustum);

  // Per face render passes
  const {width, height} = renderContext;

  const cubeDescriptors = useMemo(() =>
    seq(6).map(
      view => getRenderPassDescriptor(renderContext, {overlay, merge, label, view})
    ),
    [renderContext, overlay, merge]);

  // Constant projection matrix
  const nearFar = viewUniforms.viewNearFar.current;
  const [projectionMatrix, viewMatrix] = useOne(() => {
    const [near, far] = nearFar;
    const m = mat4.perspectiveZO(mat4.create(), τ/4, 1, near, far);
    reverseZ(m, m);
    return [m, mat4.create()];
  }, nearFar);

  uniforms.projectionMatrix.current = projectionMatrix;
  uniforms.viewNearFar.current = viewUniforms.viewNearFar.current;
  uniforms.viewResolution.current = [ 1 / width, 1 / height ];
  uniforms.viewSize.current = [ width, height ];

  const bindPass = useOne(() => {
    if (!makeBindPass) return () => {};
    const args = [];
    if (light) {
      const {storage, texture} = light;
      if (storage) args.push({storage});
      if (texture) args.push({texture});
    }
    return makeBindPass(args);
  }, light);

  return quote(yeet(() => {
    let vs = 0;
    let ts = 0;

    const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

    for (let i = 0; i < 6; ++i) {
      mat4.multiply(viewMatrix, getCubeFaceMatrix(i), viewUniforms.viewMatrix.current);

      updateViewUniforms(uniforms, projectionMatrix, viewMatrix);

      pipe.fill(uniforms);
      uploadBuffer(device, buffer, pipe.data);

      const commandEncoder = device.createCommandEncoder(LABEL);
      const passEncoder = commandEncoder.beginRenderPass(cubeDescriptors[i]);
      passEncoder.setBindGroup(0, bindGroup);
      bindPass(passEncoder);

      drawToPass(cull, opaques, passEncoder, countGeometry, uniforms, 1, true);
      drawToPass(cull, transparents, passEncoder, countGeometry, uniforms, -1, true);
      drawToPass(cull, debugs, passEncoder, countGeometry, uniforms, 1, true);

      passEncoder.end();

      const command = commandEncoder.finish();
      device.queue.submit([command]);
    }

    inspect({
      output: renderContext.source ? {
        color: renderContext.source,
        depth: renderContext.depth,
      } : undefined,
      render: {
        vertices: vs,
        triangles: ts,
      },
    });

    return null;
  }));
}, 'ColorCubePass');
