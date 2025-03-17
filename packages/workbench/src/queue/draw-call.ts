import type { LC, Ref } from '@use-gpu/live';
import type { DataBounds, StorageSource, RenderPassMode, Lazy, UniformAttribute, UseGPURenderContext, VolatileAllocation } from '@use-gpu/core';
import type { ParsedBundle } from '@use-gpu/shader';
import type { Update } from '@use-gpu/state';

import { yeet, useMemo, useNoMemo, useOne, useNoOne, SUSPEND } from '@use-gpu/live';
import { patch, $apply } from '@use-gpu/state';
import {
  makeMultiUniforms, makeBoundUniforms, makeVolatileUniforms,
  uploadBuffer,
  resolve,
} from '@use-gpu/core';
import { getBundleLabel } from '@use-gpu/shader';

import { useDeviceContext } from '../providers/device-provider';
import { useSuspenseContext } from '../providers/suspense-provider';

import { useLinkedShader } from '../hooks/useLinkedShader';
import { usePipelineLayout } from '../hooks/usePipelineLayout';
import { RenderShader, useRenderPipelineAsync, useNoRenderPipelineAsync } from '../hooks/useRenderPipeline';
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
  globalBinding?: (pipeline: GPURenderPipeline) => VolatileAllocation,
  globalDefs?: UniformAttribute[][],
  globalUniforms?: Record<string, Ref<any>>,

  pipelineKey?: string | number,
  customLayouts?: GPUBindGroupLayout[],

  renderContext: UseGPURenderContext,

  shouldDispatch?: (uniforms: Record<string, Ref<any>>) => boolean | number | null | undefined,
  onDispatch?: (uniforms: Record<string, Ref<any>>) => void,

  defines?: Record<string, any>,
  label?: string,
};

const GLOBAL_DEFINES = {
  '@group(PASS)': '@group(0)',
  '@group(VIRTUAL)': '@group(1)',
  '@group(VOLATILE)': '@group(2)',
  '@group(CUSTOM)': '@group(3)',
};

const LOCAL_DEFINES = {
  '@group(VIRTUAL)': '@group(0)',
  '@group(VOLATILE)': '@group(1)',
  '@group(CUSTOM)': '@group(2)',
  '@group(LOCAL)': '@group(3)',
};

export const DrawCall: LC<DrawCallProps> = (props: DrawCallProps) => {
  // Return a lambda back to parent(s)
  return yeet(drawCall(props));
};

const NO_CALL = null;

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
    globalBinding,
    globalDefs,
    globalUniforms,
    
    pipelineKey,
    customLayouts,

    renderContext,

    shouldDispatch,
    onDispatch,

    pipeline: propPipeline,
    defines: propDefines,
    mode = 'opaque',
    
    label,
  } = props;

  const inspect = useInspectable();

  // Render set up
  const device = useDeviceContext();
  const suspense = useSuspenseContext();

  // Render shader
  const topology = (propPipeline as any)?.primitive?.topology ?? 'triangle-list';

  // Defines
  const hasGlobals = !!(globalLayout ?? globalBinding ?? globalDefs);
  const defines = useMemo(() => (propDefines ? {
    ...(hasGlobals ? GLOBAL_DEFINES : LOCAL_DEFINES),
    ...propDefines,
  } : (hasGlobals ? GLOBAL_DEFINES : LOCAL_DEFINES)), [propDefines, hasGlobals]);

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
    label,
  );

  // Pipeline layout with global bind group and optional pass-specific bind group
  const layout = usePipelineLayout(device, entries, globalLayout, customLayouts, label);

  // Rendering pipeline
  // eslint-disable-next-line prefer-const
  let [pipeline, isStale] = useRenderPipelineAsync(
    device,
    renderContext,
    shader as RenderShader,
    layout,
    propPipeline,
    pipelineKey,
    label,
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
      shader as RenderShader,
      layout,
      propPipelineFlipped,
      pipelineKey,
      label,
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

  // @Group(n)
  const base = +!!hasGlobals;

  // Uniforms
  const uniform = useMemo(() => {
    if (globalLayout) return null;
    if (globalBinding) return globalBinding(pipeline);
    if (globalDefs) return makeMultiUniforms(device, pipeline, globalDefs, 0);
    return null;
  }, [device, pipeline, globalLayout, globalBinding, globalDefs]);

  // Bound storage
  const force = !!volatiles.length;
  const storage = useMemo(() =>
    makeBoundUniforms(device, pipeline, uniforms, bindings, base, force),
    [device, pipeline, uniforms, bindings, base, force]);

  // Volatile storage
  const volatile = useMemo(() =>
    makeVolatileUniforms(device, pipeline, volatiles, base + 1),
    [device, pipeline, volatiles, base]
  );

  const inspected = inspect({
    render: {
      vertices: 0,
      instances: 0,
      triangles: 0,
      pipeline: propPipeline,
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

  return mode ? {[mode]: {draw, bounds}} : {draw, bounds};
};

//setShaderLog(100);
//setTimeout(() => console.log(getShaderLog().map(s => [s.vertex.hash, s.fragment.hash])), 2000);
