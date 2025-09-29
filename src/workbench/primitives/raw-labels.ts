import type { LiveComponent } from '@use-gpu/live';
import type {
  TypedArray, ViewUniforms, DeepPartial, Lazy,
  UniformPipe, UniformAttribute, UniformAttributeValue, UniformType,
  VertexData, TextureSource, LambdaSource, DataBounds,
} from '@use-gpu/core';
import type { ShaderSource, ShaderModule } from '@use-gpu/shader';

import { Virtual } from './virtual';

import { use, memo, useCallback, useMemo, useOne, useNoCallback } from '@use-gpu/live';
import { bindBundle, bindingsToLinks, getBundleKey } from '@use-gpu/shader/wgsl';
import { makeShaderBindings, resolve, BLEND_ALPHA } from '@use-gpu/core';
import { useApplyTransform } from '../hooks/useApplyTransform';
import { useShaderRef } from '../hooks/useShaderRef';
import { useBoundShader } from '../hooks/useBoundShader';
import { useDataLength } from '../hooks/useDataBinding';
import { usePickingShader } from '../providers/picking-provider';
import { usePipelineOptions, PipelineOptions } from '../hooks/usePipelineOptions';

import { getLabelVertex } from '@use-gpu/wgsl/instance/vertex/label.wgsl';
import { getUIFragment } from '@use-gpu/wgsl/instance/fragment/ui.wgsl';

const DEFINES = {DEBUG_SDF: false};

export type RawLabelsProps = {
  index?: number,
  indices?: ShaderSource,

  rectangle?: number[] | TypedArray,
  uv?: number[] | TypedArray,
  st?: number[] | TypedArray,
  layout?: number[] | TypedArray,
  sdf?: number[] | TypedArray,

  position?: number[] | TypedArray,
  placement?: number[] | TypedArray,
  offset?: number,
  size?: number,
  depth?: number,
  color?: number[] | TypedArray,
  expand?: number,

  rectangles?: ShaderSource,
  uvs?: ShaderSource,
  sts?: ShaderSource,
  layouts?: ShaderSource,
  sdfs?: ShaderSource,

  positions?: ShaderSource,
  placements?: ShaderSource,
  offsets?: ShaderSource,
  sizes?: ShaderSource,
  depths?: ShaderSource,
  colors?: ShaderSource,
  expands?: ShaderSource,

  texture?: TextureSource | LambdaSource | ShaderModule,
  flip?: [number, number],

  lookups?: ShaderSource,
  ids?:     ShaderSource,
  lookup?:  number,
  id?:      number,

  count?: Lazy<number>,
} & Pick<Partial<PipelineOptions>, 'mode' | 'alphaToCoverage' | 'depthTest' | 'depthWrite' | 'blend'>;

export const RawLabels: LiveComponent<RawLabelsProps> = memo((props: RawLabelsProps) => {
  const {
    mode = 'opaque',
    alphaToCoverage = true,
    depthTest,
    depthWrite,
    blend,
    id = 0,
    count = null,
  } = props;

  const vertexCount = 4;
  const instanceCount = useDataLength(count, props.indices);

  const i = useShaderRef(props.index, props.indices);
  const r = useShaderRef(props.rectangle, props.rectangles);
  const u = useShaderRef(props.uv, props.uvs);
  const s = useShaderRef(props.st, props.sts);
  const l = useShaderRef(props.layout, props.layouts);
  const a = useShaderRef(props.sdf, props.sdfs);

  const p = useShaderRef(props.position, props.positions);
  const c = useShaderRef(props.placement, props.placements);
  const o = useShaderRef(props.offset, props.offsets);
  const z = useShaderRef(props.size, props.sizes);
  const d = useShaderRef(props.depth, props.depths);
  const f = useShaderRef(props.color, props.colors);
  const e = useShaderRef(props.expand, props.expands);

  const q  = useShaderRef(props.flip);

  const [xf,, getBounds] = useApplyTransform(p);

  let bounds: Lazy<DataBounds> | null = null;
  if (getBounds && (props.positions as any)?.bounds) {
    bounds = useCallback(() => {
      return getBounds((props.positions! as any).bounds);
    }, [props.positions, getBounds]);
  }
  else {
    useNoCallback();
  }

  const t = props.texture;

  const getVertex = useBoundShader(getLabelVertex, [i, r, u, s, l, a, xf, c, o, z, d, f, e, q]);
  const getPicking = usePickingShader(props);
  const getFragment = useBoundShader(getUIFragment, [t], DEFINES);
  const links = useOne(() => ({getVertex, getFragment, getPicking}),
    getBundleKey(getVertex) + getBundleKey(getFragment) + (getPicking ? getBundleKey(getPicking) : 0));

  const [pipeline, defs] = usePipelineOptions({
    mode,
    topology: 'triangle-strip',
    stripIndexFormat: 'uint16',
    side: 'both',
    alphaToCoverage,
    depthTest: false,
    depthWrite: false,
    blend,
  });

  const defines: Record<string, any> = useMemo(() => ({
    ...defs,
    HAS_EDGE_BLEED: true,
    HAS_MASK: false,
    DEBUG_SDF: false,
  }), [defs]);

  return use(Virtual, {
    vertexCount,
    instanceCount,
    bounds,

    links,
    defines,

    renderer: 'ui',
    pipeline,
    mode,
  });
}, 'RawLabels');
