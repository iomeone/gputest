import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { TextureSource } from '@use-gpu/core';
import type { Renderable } from '../pass';
import type { BoundLight } from '../light/types';
import { mat4 } from 'gl-matrix';

import { yeet, memo, useMemo, useOne } from '@use-gpu/live';
import { patch } from '@use-gpu/state';
import {
  makeDepthStencilAttachments, makeTexture,
  getCubeFaceLabel, getCubeFaceMatrix, reverseZ, updateViewProjection, updateViewSize,
} from '@use-gpu/core';
import { castTo } from '@use-gpu/shader/wgsl';

import { useDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useInspectable } from '../hooks/useInspectable';
import { getShader } from '../hooks/useShader';
import { useShaderRef } from '../hooks/useShaderRef';

import { useCopyDepth } from '../render/copy/value-copy';
import { SHADOW_FORMAT, SHADOW_PAGE } from '../render/light/light-data';

import { useDynamicViewBinding, useApplyPassBindGroup } from './bindings';
import { drawToPass } from './util';

import { getQuadsToHemiSample } from '@use-gpu/wgsl/render/sample/quads-to-hemi.wgsl';

const {quote} = QueueReconciler;

export type ShadowHemiPassProps = PropsWithChildren<{
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

const label = '<ShadowHemiPass>';
const LABEL = { label };
const τ = Math.PI * 2;

const HEMI_FACES = [
  [2, 0, 0, 1],
  [0, 1, 1, 1],
  [1, 1, 2, 0],
  [4, 2, 1, 1],
  [5, 2, 2, 0],
];

/** Shadow render pass.

Draws all shadow calls to a hemispherical shadow map.
*/
export const ShadowHemiPass: LC<ShadowHemiPassProps> = memo((props: ShadowHemiPassProps) => {
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
    resolution,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  } = shadow!;

  const [hemiSource, hemiDescriptors] = useMemo(() => {
    const s = Math.round(Math.max(width, height) * (resolution ?? 0.707) / 2) * 2;

    const texture = makeTexture(
      device,
      s,
      s,
      3,
      SHADOW_FORMAT,
      GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
      1,
      1,
      '2d',
    );
    texture.label = label;

    const attachments = makeDepthStencilAttachments(texture, SHADOW_FORMAT, 3);

    const descriptors = attachments.map((depthStencilAttachment) => ({
      label,
      colorAttachments: [],
      depthStencilAttachment,
    }));
    
    const viewDescriptors = HEMI_FACES.map(([face, layer,, clear]) => patch(descriptors[layer], {
      label: `<ShadowHemiPass> #${getCubeFaceLabel(face)}`,
      depthStencilAttachment: {
        depthLoadOp: clear ? 'clear' : 'load',
      },
    }));

    const source = {
      texture,
      sampler: {
        minFilter: 'nearest',
        magFilter: 'nearest',
        mipmapFilter: 'nearest',
      },
      length: s*s*3,
      size: [s, s, 3],
      format: SHADOW_FORMAT,
      layout: 'texture_depth_2d_array',
      hint: 'depth',
      version: 0,
    };

    return [source, viewDescriptors];
  }, [device, width, height, resolution]);

  const [projectionMatrix, halfProjectionMatrix, viewMatrix] = useOne(() => {
    const m = mat4.perspectiveZO(mat4.create(), τ/4, 1, near, far);
    reverseZ(m, m);
    
    const h = mat4.create();
    mat4.multiply(h, [
      1, 0, 0, 0,
      0, 2, 0, 0,
      0, 0, 1, 0,
      0,-1, 0, 1,
    ], m);

    return [m, h, mat4.create()];
  }, depth);

  updateViewProjection(uniforms, undefined, undefined, undefined, near, far);
  updateViewSize(uniforms, width, height);

  const border = Math.max(1, Math.min(4, shadowBlur || 1));
  const scaleRef = useShaderRef([width / (width - border * 2), height / (height - border * 2)]);

  const getDepth = useMemo(() => {
    const sample = getShader(getQuadsToHemiSample, [hemiSource, scaleRef]);
    return castTo(sample, 'f32');
  }, [hemiSource, scaleRef]);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const blit = useCopyDepth(renderContext, getDepth, null, shadowUV!, SHADOW_PAGE);

  const inspected = inspect({
    output: {
      depth: hemiSource,
    },
    pass: uniforms,
    bindings: dataBindings,
    render: {
      vertices: 0,
      triangles: 0,
    },
  });

  return quote(yeet(() => {
    let vs = 0;
    let ts = 0;

    const {into} = map;
    const countGeometry = (v: number, t: number) => { vs += v; ts += t; };

    for (let i = 0; i < 5; ++i) {
      const [face,, side] = HEMI_FACES[i];
      const pm = side ? halfProjectionMatrix : projectionMatrix;

      // Update view
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mat4.multiply(viewMatrix, getCubeFaceMatrix(face), into!);
      updateViewProjection(uniforms, pm, viewMatrix);
      uploadView(uniforms);

      // Render pass
      const commandEncoder = device.createCommandEncoder(LABEL);
      const passEncoder = commandEncoder.beginRenderPass(hemiDescriptors[i]);

      bindPass?.(passEncoder);

      const [w, height] = hemiSource.size;
      const y = side ? (side - 1) * (height / 2) : 0;
      const h = side ? height / 2 : height;

      passEncoder.setViewport(0, y, w, h, 0, 1);
      passEncoder.setScissorRect(0, y, w, h);

      drawToPass(cull, shadows, passEncoder, countGeometry, uniforms, 1, true);

      passEncoder.end();

      const command = commandEncoder.finish();
      device.queue.submit([command]);
    }

    {
      const commandEncoder = device.createCommandEncoder(LABEL);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const passEncoder = commandEncoder.beginRenderPass(shadowMapDescriptors[shadowMap!]);
      blit(passEncoder);
      passEncoder.end();

      const command = commandEncoder.finish();
      device.queue.submit([command]);
    }

    inspected.render.vertices = vs;
    inspected.render.triangles = ts;

    return null;
  }));
}, 'ShadowHemiPass');
