import type { LiveComponent } from '@use-gpu/live';
import type { VectorLike, Lazy, TextureSource, LambdaSource } from '@use-gpu/core';
import type { ShaderSource, ShaderModule } from '@use-gpu/shader';
import type { TransformContextProps } from '@use-gpu/workbench';

import { useDraw } from '../hooks/useDraw';

import { memo, useMemo, useOne } from '@use-gpu/live';
import { useCombinedTransform } from '../hooks/useCombinedTransform';
import { useShaderRef } from '../hooks/useShaderRef';
import { useShader } from '../hooks/useShader';
import { useDataLength } from '../hooks/useDataBinding';
import { useNativeColorTexture } from '../hooks/useNativeColor';
import { useInstancedVertex } from '../hooks/useInstancedVertex';
import { usePickingShader } from '../providers/picking-provider';
import { usePipelineOptions, PipelineOptions } from '../hooks/usePipelineOptions';

import { getSDFRectangleVertex } from '@use-gpu/wgsl/instance/vertex/sdf-rectangle.wgsl';
import { getSDFRectangleFragment } from '@use-gpu/wgsl/instance/fragment/sdf-rectangle.wgsl';

export type SDFRectanglesProps = {
  rectangle?: VectorLike,
  radius?: VectorLike,
  border?: VectorLike,
  stroke?: VectorLike,
  fill?: VectorLike,
  uv?: VectorLike,
  st?: VectorLike,
  repeat?: number,
  sdf?: VectorLike,

  rectangles?: ShaderSource,
  radii?: ShaderSource,
  borders?: ShaderSource,
  strokes?: ShaderSource,
  fills?: ShaderSource,
  uvs?: ShaderSource,
  sts?: ShaderSource,
  repeats?: ShaderSource,
  sdfs?: ShaderSource,

  instance?: number,
  instances?: ShaderSource,
  transform?: TransformContextProps | ShaderModule,

  texture?: TextureSource | LambdaSource | ShaderModule,
  clip?: ShaderModule,
  mask?: ShaderSource,

  debugContours?: boolean,

  count?: Lazy<number>,
  id?: number,
} & Pick<Partial<PipelineOptions>, 'mode' | 'depthTest' | 'depthWrite' | 'alphaToCoverage' | 'blend'>;

export const SDFRectangles: LiveComponent<SDFRectanglesProps> = memo((props: SDFRectanglesProps) => {
  const {
    count = 1,
    mode = 'transparent',
    alphaToCoverage = false,
    depthTest,
    depthWrite,
    blend,

    texture,
    transform,
    clip,
    mask,

    debugContours = false,
  } = props;

  const vertexCount = 4;
  const instanceCount = useDataLength(count, props.rectangles);

  const r = useShaderRef(props.rectangle, props.rectangles);
  const a = useShaderRef(props.radius, props.radii);
  const b = useShaderRef(props.border, props.borders);
  const s = useShaderRef(props.stroke, props.strokes);
  const f = useShaderRef(props.fill, props.fills);
  const u = useShaderRef(props.uv, props.uvs);
  const v = useShaderRef(props.st, props.sts);
  const p = useShaderRef(props.repeat, props.repeats);
  const d = useShaderRef(props.sdf, props.sdfs);

  const {transform: xf} = useCombinedTransform(transform);
  const c = clip;
  const m = mask;
  const t = useNativeColorTexture(texture);

  const boundVertex = useShader(getSDFRectangleVertex, [r, a, b, s, f, u, v, p, d, xf, c]);
  const [getVertex, totalCount, instanceDefs] = useInstancedVertex(boundVertex, props.instance, props.instances, instanceCount);
  const getPicking = usePickingShader(props);
  const getFragment = useShader(getSDFRectangleFragment, [t, m]);

  const links = useOne(() => ({getVertex, getFragment, getPicking}), [getVertex, getFragment, getPicking]);

  const [pipeline, defs] = usePipelineOptions({
    mode,
    topology: 'triangle-strip',
    stripIndexFormat: 'uint16',
    side: 'both',
    alphaToCoverage,
    depthTest,
    depthWrite,
    blend,
  });

  const defines: Record<string, any> = useMemo(() => ({
    ...defs,
    ...instanceDefs,
    HAS_EDGE_BLEED: true,
    HAS_MASK: !!mask,
    DEBUG_SDF: debugContours,
  }), [defs, instanceDefs, debugContours, mask]);

  return useDraw({
    vertexCount,
    instanceCount: totalCount,

    links,
    defines,

    renderer: 'ui',
    pipeline,
    mode,
  });
}, 'SDFRectangles');
