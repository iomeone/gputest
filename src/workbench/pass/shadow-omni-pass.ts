import type { LC, PropsWithChildren, LiveFiber, LiveElement } from '@use-gpu/live';
import type { TextureSource, ViewUniforms } from '@use-gpu/core';
import type { LightEnv, Renderable } from '../pass';
import type { BoundLight } from '../light/types';
import { mat4, vec3 } from 'gl-matrix';

import { use, quote, yeet, wrap, memo, useMemo, useOne } from '@use-gpu/live';
import {
  makeDepthStencilAttachments, makeFrustumPlanes, makeGlobalUniforms, makeOrthogonalMatrix, makeTexture, uploadBuffer,
} from '@use-gpu/core';
import { bindBundle } from '@use-gpu/shader/wgsl';

import { useDeviceContext } from '../providers/device-provider';
import { usePassContext } from '../providers/pass-provider';
import { useViewContext } from '../providers/view-provider';

import { useFrustumCuller } from '../hooks/useFrustumCuller';
import { useInspectable } from '../hooks/useInspectable';
import { useBoundShader } from '../hooks/useBoundShader';
import { useShaderRef } from '../hooks/useShaderRef';

import { SHADOW_FORMAT, SHADOW_PAGE } from '../render/light/light-data';
import { drawToPass, reverseZ } from './util';

import { getCubeToOmniSample } from '@use-gpu/wgsl/render/sample/cube-to-omni.wgsl';

import { useDepthBlit } from './depth-blit';

export type ShadowOmniPassProps = {
  calls: {
    shadow?: Renderable[],
  },
  map: BoundLight,
  descriptors: GPURenderPassDescriptor[],
  texture: TextureSource,
};

const NO_OPS: any[] = [];
const toArray = <T>(x?: T[]): T[] => Array.isArray(x) ? x : NO_OPS; 
const τ = Math.PI * 2; 

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
export const ShadowOmniPass: LC<ShadowOmniPassProps> = memo((props: PropsWithChildren<ShadowOmniPassProps>) => {
  const {
    calls,
    map,
    descriptors: shadowMapDescriptors,
    texture: shadowMapTexture,
  } = props;

  const inspect = useInspectable();

  const device = useDeviceContext();
  const {buffers: {shadow: [renderContext]}} = usePassContext();
  const {defs, uniforms: viewUniforms} = useViewContext();

  const shadows = toArray(calls['shadow'] as Renderable[]);

  const binding = useMemo(() =>
    makeGlobalUniforms(device, [defs]),
    [device, defs]);

  const {bindGroup, buffer, pipe} = binding;

  const uniforms = useOne(() => ({
    ...viewUniforms,
    projectionMatrix: { current: mat4.fromValues(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1) },
    projectionViewMatrix: { current: mat4.create() },
    projectionViewFrustum: { current: null },
    viewMatrix: { current: mat4.create() },
    viewPosition: { current: [0, 0] },
    viewNearFar: { current: [0, 0] },
    viewResolution: { current: [0, 0] },
    viewSize: { current: [0, 0] },
    viewWorldDepth: { current: 1 },
    viewPixelRatio: { current: 1 },
  }), viewUniforms) as any as ViewUniforms;

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
  } = shadow!;

  const [cubeTexture, cubeSource, cubeDescriptors] = useMemo(() => {
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

    const attachments = makeDepthStencilAttachments(texture, SHADOW_FORMAT, 6);

    const descriptors = attachments.map(depthStencilAttachment => ({
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

    return [texture, source, descriptors];
  }, [device, size]);

  const projectionMatrix = useOne(() => {
    const m = mat4.perspectiveZO(mat4.create(), τ/4, 1, near, far);
    reverseZ(m, m);
    return m;
  }, depth);

  uniforms.projectionMatrix.current = projectionMatrix;
  uniforms.viewMatrix.current = mat4.create();
  uniforms.viewNearFar.current = [ near, far ];
  uniforms.viewResolution.current = [ 1 / width, 1 / height ];
  uniforms.viewSize.current = [ width, height ];
  uniforms.viewWorldDepth.current = [1, 1];
  uniforms.viewPixelRatio.current = 1;

  const border = Math.max(1, Math.min(4, shadowBlur || 1));
  const scaleRef = useShaderRef([width / (width - border * 2), height / (height - border * 2)]);

  const getSample = useBoundShader(getCubeToOmniSample, [cubeSource, scaleRef]);
  const blit = useDepthBlit(renderContext, shadowMapDescriptors[shadowMap!], shadowUV!, SHADOW_PAGE, getSample);

  return quote(yeet(() => {
    let vs = 0;
    let ts = 0;

    const {position, into} = map;

    const countGeometry = (v: number, t: number) => { vs += v; ts += t; };
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
      mat4.multiply(viewMatrix.current, VIEW_MATRICES[i], into!);
      projectionViewMatrix.current = mat4.multiply(mat4.create(), projectionMatrix.current, viewMatrix.current);
      projectionViewFrustum.current = makeFrustumPlanes(projectionViewMatrix.current);

      mat4.invert(inverseViewMatrix.current, viewMatrix.current);
      mat4.invert(inverseProjectionViewMatrix.current, projectionViewMatrix.current);

      pipe.fill(uniforms);
      uploadBuffer(device, buffer, pipe.data);

      const commandEncoder = device.createCommandEncoder();
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
