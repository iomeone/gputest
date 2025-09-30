import type { ArrowFunction, Ref } from '@use-gpu/live';
import type { DataBounds, StorageSource, RenderPassMode, Lazy, UniformAttribute, UseGPURenderContext, VolatileAllocation } from '@use-gpu/core';
import type { ParsedBundle } from '@use-gpu/shader';
import type { Update } from '@use-gpu/state';

import { yeet, useMemo, useNoMemo, useOne, useNoOne, SUSPEND } from '@use-gpu/live';
import { patch, $apply } from '@use-gpu/state';
import {
  makeMultiUniforms, makeBoundUniforms, makeVolatileUniforms,
  VIEW_UNIFORMS,
  uploadBuffer,
  resolve,
} from '@use-gpu/core';
import { getBundleLabel } from '@use-gpu/shader';

import { useDeviceContext } from '../providers/device-provider';
import { useSuspenseContext } from '../providers/suspense-provider';

import { useLinkedShader } from '../hooks/useLinkedShader';
import { usePipelineLayout, useNoPipelineLayout } from '../hooks/usePipelineLayout';
import { useRenderPipelineAsync, useNoRenderPipelineAsync } from '../hooks/useRenderPipeline';
import { useInspectable } from '../hooks/useInspectable'

export type DrawCallProps = {
  pipeline?: Update<GPURenderPipelineDescriptor>,
  mode?: RenderPassMode | string | null,

  vertexCount?: Lazy<number>,
  instanceCount?: Lazy<number>,
  firstVertex?: Lazy<number>,
  firstInstance?: Lazy<number>,
  bounds?: Lazy<DataBounds> | null,
  indirect?: StorageSource | null,

  vertex: ParsedBundle,
  fragment?: ParsedBundle | null,

  globalLayout?: GPUBindGroupLayout,
  passLayout?: GPUBindGroupLayout,

  globalBinding?: (pipeline: GPURenderPipeline) => VolatileAllocation,
  globalDefs?: UniformAttribute[][],
  globalUniforms?: Record<string, Ref<any>>,

  renderContext: UseGPURenderContext,

  shouldDispatch?: (uniforms: Record<string, Ref<any>>) => boolean | number | null | undefined,
  onDispatch?: (uniforms: Record<string, Ref<any>>) => void,

  defines?: Record<string, any>,
};

const GLOBAL_DEFINES = {
  '@group(GLOBAL)': '@group(0)',
  '@group(VIRTUAL)': '@group(1)',
  '@group(VOLATILE)': '@group(2)',
};

const PASS_DEFINES = {
  '@group(GLOBAL)': '@group(0)',
  '@group(PASS)': '@group(1)',
  '@group(VIRTUAL)': '@group(2)',
  '@group(VOLATILE)': '@group(3)',
};

export const DrawCall = (props: DrawCallProps) => {
  // Return a lambda back to parent(s)
  return yeet(drawCall(props));
};

const NO_CALL: Record<string, ArrowFunction> = {};

// Inlined into <Virtual>
export const drawCall = (props: DrawCallProps) => {
  const {
    vertexCount,
    instanceCount,
    firstVertex,
    firstInstance,
    bounds,
    indirect,
    vertex: vertexShader,
    fragment: fragmentShader,

    globalLayout,
    passLayout,

    globalBinding,
    globalDefs,
    globalUniforms,

    renderContext,

    shouldDispatch,
    onDispatch,

    pipeline: propPipeline,
    defines: propDefines,
    mode = 'opaque',
  } = props;

  const inspect = useInspectable();

  // Render set up
  const device = useDeviceContext();
  const suspense = useSuspenseContext();

  // Render shader
  const topology = (propPipeline as any)?.primitive?.topology ?? 'triangle-list';

  const defines = useMemo(() => (propDefines ? {
    ...(passLayout ? PASS_DEFINES : GLOBAL_DEFINES),
    ...propDefines,
  } : (passLayout ? PASS_DEFINES : GLOBAL_DEFINES)), [propDefines, passLayout]);

  // Shaders
  const {
    shader,
    uniforms,
    bindings,
    constants,
    volatiles,
    entries,
  } = useLinkedShader(
    [vertexShader, fragmentShader],
    defines,
  );

  // Pipeline layout with global bind group and optional pass-specific bind group
  const layout = globalLayout
  ? usePipelineLayout(device, entries, globalLayout, passLayout)
  : useNoPipelineLayout();

  // Rendering pipeline
  // eslint-disable-next-line prefer-const
  let [pipeline, isStale] = useRenderPipelineAsync(
    device,
    renderContext,
    shader as any,
    propPipeline,
    layout as any,
  );

  // Flip pipeline winding order for mirrored passes (e.g. cubemap or reflection)
  const cullMode = (propPipeline as any)?.primitive?.cullMode;
  const needsFlip = cullMode === 'front' || cullMode === 'back';

  let pipelineFlipped = pipeline;
  if (needsFlip) {
    const propPipelineFlipped = useOne(() => patch(propPipeline, {
      primitive: {
        frontFace: $apply((s?: string) => s === 'cw' ? 'ccw' : 'cw'),
      },
    }), propPipeline);

    const [pipeline, isStaleFlipped] = useRenderPipelineAsync(
      device,
      renderContext,
      shader as any,
      propPipelineFlipped,
      layout as any,
    );
    pipelineFlipped = pipeline;
    isStale = isStale || isStaleFlipped;
  }
  else {
    useNoOne();
    useNoRenderPipelineAsync();
  }

  if (!pipeline || !pipelineFlipped) {
    useNoMemo();
    useNoMemo();
    useNoMemo();
    return suspense ? SUSPEND : NO_CALL;
  }
  if (isStale) {
    useNoMemo();
    useNoMemo();
    useNoMemo();
    return SUSPEND;
  }

  const base = 1 + +!!passLayout;

  // Uniforms
  const uniform = useMemo(() => {
    if (globalLayout) return null;
    if (globalBinding) return globalBinding(pipeline);
    return makeMultiUniforms(device, pipeline, globalDefs ?? [VIEW_UNIFORMS], 0);
  }, [device, pipeline, globalLayout, globalBinding, globalDefs]);

  // Bound storage
  const force = !!volatiles.length;
  const storage = useMemo(() =>
    makeBoundUniforms(device, pipeline, uniforms, bindings, base, force),
    [device, pipeline, uniforms, bindings, base]);

  // Volatile storage
  const volatile = useMemo(() =>
    makeVolatileUniforms(device, pipeline, volatiles, base + 1),
    [device, pipeline, uniforms, volatiles, base]
  );

  const inspected = inspect({
    render: {
      vertices: 0,
      instances: 0,
      triangles: 0,
    },
    indirect,
  });

  const isStrip = topology === 'triangle-strip';
  const isVolatileGlobal = typeof uniform?.bindGroup === 'function';

  let dispatchVersion: number | null = null;

  const inner = (
    passEncoder: GPURenderPassEncoder,
    countGeometry: (v: number, t: number) => void,
    uniforms: Record<string, Ref<any>>,
    flip?: boolean,
  ) => {
    onDispatch && onDispatch(uniforms);

    const v = resolve(vertexCount || 0);
    const i = resolve(instanceCount || 0);
    const fv = resolve(firstVertex || 0);
    const fi = resolve(firstInstance || 0);

    const t = isStrip ? (v - 2) * i : Math.floor(v * i / 3);

    inspected.render.vertices = v;
    inspected.render.instances = i;
    inspected.render.triangles = t;

    countGeometry(v * i, t);

    if (!indirect && (v * i) === 0) return;

    passEncoder.setPipeline(flip ? pipelineFlipped : pipeline);

    if (uniform) {
      if (globalUniforms) {
        (uniform as any).pipe.fill(globalUniforms);
        uploadBuffer(device, (uniform as any).buffer, (uniform as any).pipe.data);
      }

      if (isVolatileGlobal) passEncoder.setBindGroup(0, (uniform as any).bindGroup());
      else passEncoder.setBindGroup(0, (uniform as any).bindGroup);
    }

    if (storage.pipe && storage.buffer) {
      storage.pipe.fill(constants);
      uploadBuffer(device, storage.buffer, storage.pipe.data);
    }

    if (storage.bindGroup) passEncoder.setBindGroup(base, storage.bindGroup);
    if (volatile.bindGroup) passEncoder.setBindGroup(base + 1, volatile.bindGroup());

    if (indirect) passEncoder.drawIndirect(indirect.buffer, indirect.byteOffset ?? 0);
    else {
      if (Number.isNaN(v * i * fv * fi)) console.warn(
        'NaN draw call',
        vertexShader && getBundleLabel(vertexShader),
        fragmentShader && getBundleLabel(fragmentShader),
      );
      else passEncoder.draw(v, i, fv, fi);
    }
  };

  let draw = inner;
  if (shouldDispatch) {
    draw = (
      passEncoder: GPURenderPassEncoder,
      countGeometry: (v: number, t: number) => void,
      uniforms: Record<string, Ref<any>>,
      flip?: boolean,
    ) => {
      const d = shouldDispatch(uniforms);
      if (d === false) return;
      if (typeof d === 'number') {
        if (dispatchVersion === d) return;
        dispatchVersion = d;
      }

      return inner(passEncoder, countGeometry, uniforms, flip);
    };
  }

  return mode ? {[mode]: {draw, bounds}} : {draw};
};

//setShaderLog(100);
//setTimeout(() => console.log(getShaderLog().map(s => [s.vertex.hash, s.fragment.hash])), 2000);
