import type { LiveComponent } from '@use-gpu/live';
import type { TypedArray, Lazy, UniformAttribute } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';
import type { SDFGlyphData } from '../text/types';

import { resolve, seq } from '@use-gpu/core';
import { gather, use, memo, useOne } from '@use-gpu/live';
import { useApplyTransform } from '../hooks/useApplyTransform';
import { useDataLength } from '../hooks/useDataBinding';
import { useDerivedSource } from '../hooks/useDerivedSource';
import { useRawSource } from '../hooks/useRawSource';
import { useSource } from '../hooks/useSource';
import { useScratchSource } from '../hooks/useScratchSource';
import { useShaderRef } from '../hooks/useShaderRef';
import { useShader } from '../hooks/useShader';

import { TransformContextProps } from '../providers/transform-provider';

import { Dispatch } from '../queue/dispatch';
// import { Readback } from '../primitives/readback';
import { PassReconciler } from '../reconcilers/index';
import { useSDFFontContext } from '../text/providers/sdf-font-provider';
import { GlyphSource } from '../text/glyph-source';

import { RawLabels, RawLabelsFlags } from '../primitives/raw-labels';

import { main as computeArcLength } from '@use-gpu/wgsl/instance/compute/arc-length.wgsl';
import { main as computeArcPrefixSum } from '@use-gpu/wgsl/instance/compute/arc-prefix-sum.wgsl';
import { attachArcLabelTo } from '@use-gpu/wgsl/instance/vertex/arc-label.wgsl';

const {quote} = PassReconciler;

const POSITIONS: UniformAttribute = { format: 'vec4<f32>', name: 'getPosition' };
const TRIMS: UniformAttribute = { format: 'vec2<u32>', name: 'getTrim' };
const ANCHORS: UniformAttribute = { format: 'vec2<u32>', name: 'getAnchor' };

const READ_ONLY_SOURCE = { readWrite: false };
const READ_WRITE_SOURCE_VOLATILE = { readWrite: true, flags: GPUBufferUsage?.STORAGE | GPUBufferUsage?.COPY_SRC, volatile: true };

export type ArcLabelLayerProps = RawLabelsFlags & {
  position?: number[] | TypedArray,
  placement?: number[] | TypedArray,
  offset?: number,
  size?: number,
  depth?: number,
  zBias?: number,
  color?: number[] | TypedArray,
  expand?: number,
  trim?: TypedArray,
  anchor?: TypedArray,

  positions?: ShaderSource,
  placements?: ShaderSource,
  offsets?: ShaderSource,
  sizes?: ShaderSource,
  depths?: ShaderSource,
  zBiases?: ShaderSource,
  colors?: ShaderSource,
  expands?: ShaderSource,
  trims?: ShaderSource,
  anchors?: ShaderSource,

  label?: string,
  labels?: string[] | Uint16Array,

  family?: string,
  weight?: string | number,
  style?: string,

  instance?: number,
  instances?: ShaderSource,
  transform?: TransformContextProps,

  flip?: boolean,
  monochrome?: boolean,

  maxArc?: number,
  detail?: number,
  count?: Lazy<number>,
};

/** Draws text labels on arcs. */
export const ArcLabelLayer: LiveComponent<ArcLabelLayerProps> = memo((props: ArcLabelLayerProps) => {
  const {
    placement,
    placements,
    offset,
    offsets,
    size,
    sizes,
    depth,
    depths,
    color,
    colors,
    expand,
    expands,

    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    position,
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    positions,
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    trim,
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    trims,
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    anchor,
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    anchors,

    label,
    labels,

    family,
    weight,
    style,

    instance,
    instances,
    transform,

    monochrome,
    detail,
    maxArc = 64,

    count: propCount,
    mode = 'opaque',

    ...rest
  } = props;
  
  const strings = useOne(() => labels ?? (label != null ? [label] : []), labels ?? label);

  const ps = useSource(POSITIONS, useShaderRef(props.position, props.positions));
  const ts = useSource(TRIMS, useShaderRef(props.trim, props.trims));
  const as = useSource(ANCHORS, useShaderRef(props.anchor, props.anchors));

  const {positions: getPosition} = useApplyTransform(ps, transform);

  const logMaxArc = Math.ceil(Math.log2(maxArc));

  return (
    gather(
      use(GlyphSource, {
        family,
        weight,
        style,
        strings,
        size: detail,
        monochrome,
      }),
      ([data] : SDFGlyphData[]) => {
        if (!data) return null;

        const {count, sdf} = data;
        if (count === 0) return null;

        const {getTexture} = useSDFFontContext();
        const texture = getTexture();

        const indices = useRawSource(data.indices, 'u32');
        const rectangles = useRawSource(data.rectangles, 'vec4<f32>');
        const layouts = useRawSource(data.layouts, 'vec2<f32>');
        const uvs = useRawSource(data.uvs, 'vec4<f32>');

        const vertexCount = useDataLength(propCount, props.positions);
        const [arcLengths, allocateArcLengths] = useScratchSource('f32', READ_WRITE_SOURCE_VOLATILE);        

        const onDispatch = () => {
          allocateArcLengths(resolve(vertexCount));
        };

        const arcLengthsReadout = useDerivedSource(arcLengths, READ_ONLY_SOURCE);

        const makeOnPassDispatch = (count: number) => () => {
          stepCount.current = count;
        };

        const dispatchSize = useShaderRef(vertexCount);
        const stepCount = useShaderRef(0);

        const arcLengthShader = useShader(
          computeArcLength, [
            dispatchSize,
            getPosition,
            ts,
            arcLengths,
          ],
        );

        const arcPrefixSumShader = useShader(
          computeArcPrefixSum, [
            dispatchSize,
            stepCount,
            ts,
            arcLengths,
          ],
        );
        
        const attachLabelShader = useShader(
          attachArcLabelTo, [
            getPosition,
            as,
            arcLengthsReadout,
          ],
        );

        const dispatches = quote([
          use(Dispatch, {
            shader: arcLengthShader,
            size: vertexCount,
            group: [64],
            label: 'arcLength',
            onDispatch,
          }),
          ...seq(logMaxArc).map(step => 
            use(Dispatch, {
              shader: arcPrefixSumShader,
              size: vertexCount,
              group: [64],
              label: 'arcPrefixSum',
              onDispatch: makeOnPassDispatch(step),
            })
          ),
          /*
          use(Readback, {
            source: arcLengths,
            then: (data: any) => {
              const n = resolve(vertexCount);
              const out = [];
              const fmt = (x: number) => (x >= 0 ? ' ' : '') + x.toFixed(2);
              for (let i = 0; i < n; i++) {
                out.push(fmt(data[i]));
              }
              console.log('+>', n, out);
            },
          }),
          */
        ]);

        const render = (
          use(RawLabels, {
            count,

            indices,
            rectangles,
            layouts,
            uvs,
            sdf,
            texture,

            instance,
            instances,
            transform,

            placement,
            placements,
            offset,
            offsets,
            size,
            sizes,
            depth,
            depths,
            color,
            colors,
            expand,
            expands,

            attachTo: attachLabelShader,

            mode,

            ...rest,
          })
        );
        
        return [
          dispatches,
          render,
        ];
      },
    )
  )
}, 'ArcLabelLayer');

