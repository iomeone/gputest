import type { LC, PropsWithChildren } from '../../live';
import type { Renderable } from '../pass';
import type { BoundLight } from '../light/types';
import { mat4, vec4 } from 'gl-matrix';

import { yeet, memo, useOne } from '../../live';
import { updateViewProjection, updateViewSize } from '../../core';

import { useDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useInspectable } from '../hooks/useInspectable'

import { useCopyDepth } from '../render/copy/value-copy';
import { SHADOW_PAGE } from '../render/light/light-data';

import { useDynamicViewBinding, useApplyPassBindGroup } from './bindings';
import { drawToPass } from './util';

const {quote} = QueueReconciler;

export type ShadowOrthoPassProps = PropsWithChildren<{
  env: Record<string, any>,
  calls: {
    shadow?: Renderable[],
  },
  map: BoundLight,
  descriptors: GPURenderPassDescriptor[],
}>;

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

/** Orthographic shadow render pass.

Draws all shadow calls to an orthographic shadow map.
*/
export const ShadowOrthoPass: LC<ShadowOrthoPassProps> = memo((props: ShadowOrthoPassProps) => {
  const {
    env,
    calls,
    map,
    descriptors,
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();
  const {
    buffers: {shadow: [renderContext]},
    bindGroups: {view: viewBindGroup},
  } = usePassContext();

  const shadows = toArray(calls['shadow'] as Renderable[]);

  // Bind to dynamic view
  const {bindGroup, cull, uniforms, upload: uploadView} = useDynamicViewBinding(viewBindGroup);
  const {bindPass, dataBindings} = useApplyPassBindGroup(env, bindGroup);

  const {
    shadow,
    shadowMap,
    shadowUV,
  } = map;

  const {
    depth: [near, far],
    size: [width, height],
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  } = shadow!;

  updateViewProjection(uniforms, undefined, undefined, undefined, near, far);
  updateViewSize(uniforms, width, height);

  const projectionMatrix = useOne(() => mat4.fromValues(1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1));

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const clearDepthBuffer = useCopyDepth(renderContext, null, null, shadowUV!, SHADOW_PAGE);

  const inspected = inspect({
    pass: uniforms,
    bindings: dataBindings,
    render: {
      vertices: 0,
      triangles: 0,
    },
  });

  const draw = quote(yeet(() => {
    let vs = 0;
    let ts = 0;

    const {
      into,
      normal,
    } = map;

    const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const x = shadowUV![0] * SHADOW_PAGE;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const y = shadowUV![1] * SHADOW_PAGE;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const w = (shadowUV![2] - shadowUV![0]) * SHADOW_PAGE;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const h = (shadowUV![3] - shadowUV![1]) * SHADOW_PAGE;

    // Update view
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const position = vec4.fromValues(-normal![0], -normal![1], -normal![2], 0);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    updateViewProjection(uniforms, projectionMatrix, into!, position);
    uploadView(uniforms);

    // Render pass
    const commandEncoder = device.createCommandEncoder();

    {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const passEncoder = commandEncoder.beginRenderPass(descriptors[shadowMap!]);
      clearDepthBuffer(passEncoder);
      passEncoder.end();
    }

    {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const passEncoder = commandEncoder.beginRenderPass(descriptors[shadowMap!]);
      bindPass?.(passEncoder);

      passEncoder.setViewport(x, y, w, h, 0, 1);
      passEncoder.setScissorRect(x, y, w, h);

      drawToPass(cull, shadows, passEncoder, countGeometry, uniforms);

      passEncoder.end();
    }

    const command = commandEncoder.finish();
    device.queue.submit([command]);

    inspected.render.vertices = vs;
    inspected.render.triangles = ts;

    return null;
  }));

  return draw;
}, 'ShadowOrthoPass');
