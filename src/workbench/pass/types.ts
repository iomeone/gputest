import type { DataBounds, Lazy, RenderPassMode, StorageSource, TextureSource } from '@use-gpu/core';
import type { LiveComponent, ArrowFunction } from '@use-gpu/live';
import type { ShaderModule } from '@use-gpu/shader';
import type { Update } from '@use-gpu/state';
import type { BoundLight } from '../light/types';
import { vec3 } from 'gl-matrix';

export type LightEnv = {
  lights: Map<number, BoundLight>,
  shadows: Map<number, BoundLight>,
  order: number[],
  subranges: Map<number, [number, number]>,
  storage: StorageSource,
  texture: TextureSource,
};

export type Culler = (center: vec3, radius: number) => number | boolean;

export type Renderable = {
  draw: RenderToPass,
  bounds?: Lazy<DataBounds>,
};

export type RenderComponents = {
  modes: Record<string, LiveComponent<any>>,
  renders: Record<string, Record<string, LiveComponent<any>>>,
};

export type RenderCounter = (v: number, t: number) => void;
export type RenderToPass = (
  passEncoder: GPURenderPassEncoder,
  countGeometry: RenderCounter,
  uniforms: Record<string, any>,
  flip?: boolean,
) => void;

export type ComputeCounter = (d: number) => void;
export type ComputeToPass = (
  passEncoder: GPUComputePassEncoder,
  countDispatch: ComputeCounter,
) => void;

export type CommandToBuffer = () => GPUCommandBuffer;

export type AggregatedCalls = {
  env?: any[],

  dispatch?: ArrowFunction[],
  compute?: ComputeToPass[],
  opaque?: Renderable[],
  transparent?: Renderable[],
  debug?: Renderable[],
  picking?: Renderable[],
  stencil?: Renderable[],
  light?: Renderable[],
  shadow?: Renderable[],
  post?: CommandToBuffer[],
  readback?: ArrowFunction[],
};

export type VirtualDraw = {
  pipeline: Update<GPURenderPipelineDescriptor>,
  defines: Record<string, any>,
  mode: RenderPassMode | string,
  renderer: string,

  vertexCount?: Lazy<number>,
  instanceCount?: Lazy<number>,
  firstVertex?: Lazy<number>,
  firstInstance?: Lazy<number>,
  bounds?: Lazy<DataBounds>,
  indirect?: StorageSource,

  links: Record<string, ShaderModule>,

  shouldDispatch?: () => boolean | number | undefined,
  onDispatch?: () => void,
};
