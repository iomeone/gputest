import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { TextureSource, ViewUniforms } from '@use-gpu/core';
import type { Renderable } from '../pass';
import type { BoundLight } from '../light/types';
import { mat4 } from 'gl-matrix';

import { yeet, memo, useMemo, useOne } from '@use-gpu/live';
import {
  makeDepthStencilAttachments, makeFrustumPlanes, makeGlobalUniforms, makeTexture, uploadBuffer,
  VIEW_UNIFORMS,
} from '@use-gpu/core';

import { useDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { QueueReconciler } from '../reconcilers/index';

import { useFrustumCuller } from '../hooks/useFrustumCuller';
import { useInspectable } from '../hooks/useInspectable';
import { useShader } from '../hooks/useShader';
import { useShaderRef } from '../hooks/useShaderRef';

import { SHADOW_FORMAT, SHADOW_PAGE } from '../render/light/light-data';
import { drawToPass, reverseZ } from './util';

import { getCubeToOmniSample } from '@use-gpu/wgsl/render/sample/cube-to-omni.wgsl';

import { useDepthBlit } from './depth-blit';

const {quote} = QueueReconciler;

export type ShadowOmniPassProps = PropsWithChildren<{
  calls: {
    shadow?: Renderable[],
  },
  map: BoundLight,
  descriptors: GPURenderPassDescriptor[],
  texture: TextureSource,
}>;

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS;
const τ = Math.PI * 2;

const label = '<ShadowOmniPass>';
const LABEL = { label };

const VIEW_LABELS = ['Right', 'Left', 'Top', 'Bottom', 'Front', 'Back'];

const VIEW_MATRICES = [
  mat4.fromValues(
    0, 0,-1, 0,
    0, 1, 0, 0,
   -1, 0, 0, 0,
    0, 0, 0, 1,
  ),  // R
  mat4.fromValues(
    0, 0, 1, 0,
    0, 1, 0, 0,
    1, 0, 0, 0,
    0, 0, 0, 1,
  ),  // L
  mat4.fromValues(
   -1, 0, 0, 0,
    0, 0,-1, 0,
    0, 1, 0, 0,
    0, 0, 0, 1,
  ),  // T
  mat4.fromValues(
    1, 0, 0, 0,
    0, 0, 1, 0,
    0, 1, 0, 0,
    0, 0, 0, 1,
  ),  // Bm
  mat4.fromValues(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0,-1, 0,
    0, 0, 0, 1,
  ),  // F
  mat4.fromValues(
   -1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ),  // Bk
];

/** Shadow render pass.

Draws all shadow calls to an omnidirectional shadow map.
*/
export const ShadowOmniPass: LC<ShadowOmniPassProps> = memo((props: ShadowOmniPassProps) => {
  const {
    calls,
    map,
    descriptors: shadowMapDescriptors,
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();
  const {buffers: {shadow: [renderContext]}} = usePassContext();

  const shadows = toArray(calls['shadow'] as Renderable[]);

  const binding = useMemo(() =>
    makeGlobalUniforms(device, [VIEW_UNIFORMS]),
    [device]);

  const {bindGroup, buffer, pipe} = binding;

  const uniforms: ViewUniforms = useOne(() => ({
    projectionMatrix: { current: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1) },
    projectionViewMatrix: { current: mat4.create() },
    projectionViewFrustum: { current: null as any },
    inverseViewMatrix: { current: mat4.create() },
    inverseProjectionViewMatrix: { current: mat4.create() },
    viewMatrix: { current: mat4.create() },
    viewPosition: { current: null as any },
    viewNearFar: { current: null as any },
    viewResolution: { current: null as any },
    viewSize: { current: null as any },
    viewWorldDepth: { current: [1, 1] },
    viewPixelRatio: { current: 1 },
  }));

  const {viewPosition, projectionViewFrustum} = uniforms;
  const cull = useFrustumCuller(viewPosition, projectionViewFrustum);

  const {
    shadow,
    shadowMap,
    shadowUV,
    shadowBlur,
  } = map;

  const {
    depth, depth: [near, far],
    size, size: [width, height],
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
      label: `<ShadowOmniPass> ${VIEW_LABELS[i]}`,
      colorAttachments: [],
      depthStencilAttachment,
    }));

    const source = {
      texture,
      sampler: {},
      length: s*s*6,
      size: [s, s, 6],
      format: SHADOW_FORMAT,
      layout: 'texture_depth_cube',
      version: 0,
    };

    return [source, descriptors];
  }, [device, size]);

  const projectionMatrix = useOne(() => {
    const m = mat4.perspectiveZO(mat4.create(), τ/4, 1, near, far);
    reverseZ(m, m);
    return m;
  }, depth);

  uniforms.projectionMatrix.current = projectionMatrix;
  uniforms.viewNearFar.current = [ near, far ];
  uniforms.viewResolution.current = [ 1 / width, 1 / height ];
  uniforms.viewSize.current = [ width, height ];

  const border = Math.max(1, Math.min(4, shadowBlur || 1));
  const scaleRef = useShaderRef([width / (width - border * 2), height / (height - border * 2)]);

  const getSample = useShader(getCubeToOmniSample, [cubeSource, scaleRef]);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const blit = useDepthBlit(renderContext, shadowMapDescriptors[shadowMap!], shadowUV!, SHADOW_PAGE, getSample);

  return quote(yeet(() => {
    let vs = 0;
    let ts = 0;

    const {position, into} = map;

    const countGeometry = (v: number, t: number) => { vs += v; ts += t; };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    uniforms.viewPosition.current = position!;

    const {
      projectionViewMatrix,
      projectionViewFrustum,
      projectionMatrix,
      viewMatrix,
      inverseViewMatrix,
      inverseProjectionViewMatrix,
    } = uniforms;

    for (let i = 0; i < 6; ++i) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mat4.multiply(viewMatrix.current, VIEW_MATRICES[i], into!);
      projectionViewMatrix.current = mat4.multiply(mat4.create(), projectionMatrix.current, viewMatrix.current);
      projectionViewFrustum.current = makeFrustumPlanes(projectionViewMatrix.current);

      mat4.invert(inverseViewMatrix.current, viewMatrix.current);
      mat4.invert(inverseProjectionViewMatrix.current, projectionViewMatrix.current);

      pipe.fill(uniforms);
      uploadBuffer(device, buffer, pipe.data);

      const commandEncoder = device.createCommandEncoder(LABEL);
      const passEncoder = commandEncoder.beginRenderPass(cubeDescriptors[i]);
      passEncoder.setBindGroup(0, bindGroup);

      drawToPass(cull, shadows, passEncoder, countGeometry, uniforms, 1, true);

      passEncoder.end();

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
    });

    return null;
  }));
}, 'ShadowOmniPass');
