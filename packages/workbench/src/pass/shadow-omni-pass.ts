import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { TextureSource } from '@use-gpu/core';
import type { Renderable } from '../pass';
import type { BoundLight } from '../light/types';
import { mat4 } from 'gl-matrix';

import { yeet, memo, useMemo, useOne } from '@use-gpu/live';
import {
  makeDepthStencilAttachments, makeTexture, uploadBuffer,
  getCubeFaceLabel, getCubeFaceMatrix, reverseZ, updateViewProjection, updateViewSize,
} from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useInspectable } from '../hooks/useInspectable';
import { useShader } from '../hooks/useShader';
import { useShaderRef } from '../hooks/useShaderRef';

import { SHADOW_FORMAT, SHADOW_PAGE } from '../render/light/light-data';

import { useDynamicViewBinding, useApplyPassBindGroup } from './bindings';
import { useDepthBlit } from './depth-blit';
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
  const {cull, binding, pipe, source, uniforms} = useDynamicViewBinding(viewBindGroup);
  const {bindPass, dataBindings} = useApplyPassBindGroup(env, binding);

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

  const getSample = useShader(getCubeToOmniSample, [cubeSource, scaleRef]);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const blit = useDepthBlit(renderContext, shadowMapDescriptors[shadowMap!], shadowUV!, SHADOW_PAGE, getSample);

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

      pipe.fill(uniforms);
      uploadBuffer(device, source.buffer, pipe.data);

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
      blit(commandEncoder);

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
      pass: {
        uniforms,
      },
      bindings: dataBindings,
    });

    return null;
  }));
}, 'ShadowOmniPass');
