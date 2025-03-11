import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { TextureSource } from '@use-gpu/core';
import type { Renderable } from '../pass';
import type { BoundLight } from '../light/types';
import { mat4 } from 'gl-matrix';

import { yeet, memo, useMemo, useOne } from '@use-gpu/live';
import {
  makeDepthStencilAttachments, makeTexture,
  getCubeFaceLabel, getCubeFaceMatrix, reverseZ, updateViewProjection, updateViewSize,
} from '@use-gpu/core';
import { castTo } from '@use-gpu/shader/wgsl';

import { useDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useInspectable } from '../hooks/useInspectable';
import { useShader, getShader } from '../hooks/useShader';
import { useShaderRef } from '../hooks/useShaderRef';

import { SHADOW_FORMAT, SHADOW_PAGE } from '../render/light/light-data';

import { useDynamicViewBinding, useApplyPassBindGroup } from './bindings';
import { useDepthCopy } from './depth-copy';
import { drawToPass } from './util';

import { getCubeToOmniSample } from '@use-gpu/wgsl/render/sample/cube-to-omni.wgsl';

const {quote} = QueueReconciler;

export type ShadowOmniPassProps = PropsWithChildren<{
  env: Record<string, any>,
  calls: {
    shadow?: Renderable[],
  },
  map: BoundLight,
  descriptors: GPURenderPassDescriptor[],
  texture: TextureSource,
}>;

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;

const label = '<ShadowOmniPass>';
const LABEL = { label };
const τ = Math.PI * 2;

/** Shadow render pass.

Draws all shadow calls to an omnidirectional shadow map.
*/
export const ShadowOmniPass: LC<ShadowOmniPassProps> = memo((props: ShadowOmniPassProps) => {
  const {
    env,
    calls,
    map,
    descriptors: shadowMapDescriptors,
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
    shadowBlur,
  } = map;

  const {
    depth, depth: [near, far],
    size: [width, height],
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  } = shadow!;

  const [cubeSource, cubeDescriptors] = useMemo(() => {
    const s = Math.round(Math.max(width, height) * .5);
    const texture = makeTexture(
      device,
      s,
      s,
      6,
      SHADOW_FORMAT,
      GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      1,
      1,
      '2d',
    );
    texture.label = label;

    const attachments = makeDepthStencilAttachments(texture, SHADOW_FORMAT, 6);

    const descriptors = attachments.map((depthStencilAttachment, i) => ({
      label: `<ShadowOmniPass> ${getCubeFaceLabel(i)}`,
      colorAttachments: [],
      depthStencilAttachment,
    }));

    const source = {
      texture,
      sampler: {
        minFilter: 'nearest',
        magFilter: 'nearest',
        mipmapFilter: 'nearest',
      },
      length: s*s*6,
      size: [s, s, 6],
      format: SHADOW_FORMAT,
      layout: 'texture_depth_cube',
      version: 0,
    };

    return [source, descriptors];
  }, [device, width, height]);

  const [projectionMatrix, viewMatrix] = useOne(() => {
    const m = mat4.perspectiveZO(mat4.create(), τ/4, 1, near, far);
    reverseZ(m, m);
    return [m, mat4.create()];
  }, depth);

  updateViewProjection(uniforms, undefined, undefined, undefined, near, far);
  updateViewSize(uniforms, width, height);

  const border = Math.max(1, Math.min(4, shadowBlur || 1));
  const scaleRef = useShaderRef([width / (width - border * 2), height / (height - border * 2)]);

  const getDepth = useMemo(() => {
    const sample = getShader(getCubeToOmniSample, [cubeSource, scaleRef]);
    return castTo(sample, 'f32');
  }, [cubeSource]);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const blit = useDepthCopy(renderContext, getDepth, null, shadowUV!, SHADOW_PAGE);

  return quote(yeet(() => {
    let vs = 0;
    let ts = 0;

    const {into} = map;
    const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

    for (let i = 0; i < 6; ++i) {
      // Update view
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mat4.multiply(viewMatrix, getCubeFaceMatrix(i), into!);
      updateViewProjection(uniforms, projectionMatrix, viewMatrix);
      uploadView(uniforms);

      // Render pass
      const commandEncoder = device.createCommandEncoder(LABEL);
      const passEncoder = commandEncoder.beginRenderPass(cubeDescriptors[i]);

      bindPass?.(passEncoder);

      drawToPass(cull, shadows, passEncoder, countGeometry, uniforms, 1, true);

      passEncoder.end();

      const command = commandEncoder.finish();
      device.queue.submit([command]);
    }

    {
      const commandEncoder = device.createCommandEncoder(LABEL);
      const passEncoder = commandEncoder.beginRenderPass(shadowMapDescriptors[shadowMap!]);
      blit(passEncoder);
      passEncoder.end();

      const command = commandEncoder.finish();
      device.queue.submit([command]);
    }

    inspect({
      output: {
        depth: cubeSource,
      },
      render: {
        vertices: vs,
        triangles: ts,
      },
      pass: uniforms,
      bindings: dataBindings,
    });

    return null;
  }));
}, 'ShadowOmniPass');
