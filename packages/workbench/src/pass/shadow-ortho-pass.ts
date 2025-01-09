import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { ViewUniforms } from '@use-gpu/core';
import type { Renderable } from '../pass';
import type { BoundLight } from '../light/types';
import { mat4, vec4 } from 'gl-matrix';

import { yeet, memo, useMemo, useOne } from '@use-gpu/live';
import {
  makeFrustumPlanes, makeGlobalUniforms, makeViewUniforms, uploadBuffer, updateViewUniforms,
  VIEW_UNIFORMS,
} from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useFrustumCuller } from '../hooks/useFrustumCuller'
import { useInspectable } from '../hooks/useInspectable'

import { SHADOW_PAGE } from '../render/light/light-data';
import { drawToPass } from './util';

import { useDepthBlit } from './depth-blit';

const {quote} = QueueReconciler;

export type ShadowOrthoPassProps = PropsWithChildren<{
  calls: {
    shadow?: Renderable[],
  },
  map: BoundLight,
  descriptors: GPURenderPassDescriptor[],
}>;

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

const label = '<ShadowOrthoPass>';
const LABEL = { label };

/** Orthographic shadow render pass.

Draws all shadow calls to an orthographic shadow map.
*/
export const ShadowOrthoPass: LC<ShadowOrthoPassProps> = memo((props: ShadowOrthoPassProps) => {
  const {
    calls,
    map,
    descriptors,
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();
  const {buffers: {shadow: [renderContext]}} = usePassContext();

  const shadows = toArray(calls['shadow'] as Renderable[]);

  const binding = useMemo(() =>
    makeGlobalUniforms(device, [VIEW_UNIFORMS]),
    [device]);

  const {bindGroup, buffer, pipe} = binding;

  const projectionMatrix = useOne(() => mat4.fromValues(1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1));

  const uniforms: ViewUniforms = useOne(makeViewUniforms);

  const {viewPosition, projectionViewFrustum} = uniforms;
  const cull = useFrustumCuller(viewPosition, projectionViewFrustum);

  const {
    into,
    normal,
    shadow,
    shadowMap,
    shadowUV,
  } = map;

  const {
    depth: [near, far],
    size: [width, height],
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  } = shadow!;

  uniforms.viewNearFar.current = [ near, far ];
  uniforms.viewResolution.current = [ 1 / width, 1 / height ];
  uniforms.viewSize.current = [ width, height ];

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const clear = useDepthBlit(renderContext, descriptors[shadowMap!], shadowUV!, SHADOW_PAGE);

  const draw = quote(yeet(() => {
    let vs = 0;
    let ts = 0;

    const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const position = vec4.fromValues(-normal![0], -normal![1], -normal![2], 0);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    updateViewUniforms(uniforms, projectionMatrix, into!, position);

    pipe.fill(uniforms);
    uploadBuffer(device, buffer, pipe.data);

    const commandEncoder = device.createCommandEncoder(LABEL);

    clear(commandEncoder);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const x = shadowUV![0] * SHADOW_PAGE;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const y = shadowUV![1] * SHADOW_PAGE;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const w = (shadowUV![2] - shadowUV![0]) * SHADOW_PAGE;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const h = (shadowUV![3] - shadowUV![1]) * SHADOW_PAGE;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const passEncoder = commandEncoder.beginRenderPass(descriptors[shadowMap!]);
    passEncoder.setViewport(x, y, w, h, 0, 1);
    passEncoder.setScissorRect(x, y, w, h);
    passEncoder.setBindGroup(0, bindGroup);

    drawToPass(cull, shadows, passEncoder, countGeometry, uniforms);

    passEncoder.end();

    const command = commandEncoder.finish();
    device.queue.submit([command]);

    inspect({
      render: {
        vertices: vs,
        triangles: ts,
      },
    });

    return null;
  }));

  return draw;
}, 'ShadowOrthoPass');
