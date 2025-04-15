import React from '@use-gpu/live';
import type { LC, LiveElement } from '@use-gpu/live';
import type { ShaderSource } from '@use-gpu/shader';

import { Gather, useMemo } from '@use-gpu/live';
import { chainTo, wgsl } from '@use-gpu/shader/wgsl';
import { Fetch, ImageTexture, PointLayerProps, useRenderProp, getShader, useShader, useShaderRef } from '@use-gpu/workbench';

const makeValueMapper = (precision: number) => wgsl`
@link fn getIntTexture(ij: vec2<u32>, level: u32) -> vec4<u32>;
@link fn getBase() -> f32;

@export fn getValue(ij: vec2<u32>) -> f32 {
  let rgba = getIntTexture(ij, 0u);
  let i = (rgba.b << 16) | (rgba.g << 8) | rgba.r;
  let v = f32(i) / ${precision};
  return v + getBase();
}
`;

const xyzwMapper = wgsl`
@optional @link fn getX(ij: vec2<u32>) -> f32 { return 0.0; };
@optional @link fn getY(ij: vec2<u32>) -> f32 { return 0.0; };
@optional @link fn getZ(ij: vec2<u32>) -> f32 { return 0.0; };
@optional @link fn getW(ij: vec2<u32>) -> f32 { return 1.0; };

@export fn getValue(ij: vec2<u32>) -> vec4<f32> {
  let x = getX(ij);
  let y = getY(ij);
  let z = getZ(ij);
  let w = getW(ij);

  return vec4<f32>(x, y, z, w);
}
`;

const indexToXYMapper = wgsl`
@link fn getModulus() -> u32;

@export fn indexToXY(i: u32) -> vec2<u32> {
  let m = getModulus();
  let x = i % m;
  let y = i / m;
  
  return vec2<u32>(x, y);
}
`;

type RenderAttributes = {
  attributes: Pick<PointLayerProps, 'positions' | 'count'>,
  boundingBox: DataBoundingBox,
};

export type PointCloudLoaderProps = {
  url: string,
  absolute?: boolean,
  
  render?: (attributes: RenderAttributes) => LiveElement,
  children?: (attributes: RenderAttributes) => LiveElement,
};

export const PointCloudLoader: LC<PointCloudLoaderProps> = (props: PointCloudLoaderProps) => {
  const {url, absolute} = props;
  
  const base = url.split('/').slice(0, -1).join('/');
  const getURL = (path: string) => `${base}/${path}`;

  return (
    <Fetch
      url={url}
      type="json"
    >{(data) => {
        const {fields, imageSize, recordCount} = data;
        
        const images: LiveElement[] = [];
        const mappers: ShaderModule[] = [];
        const min: number[] = [];
        const max: number[] = [];
        
        const {width, height} = imageSize;
        const size = useShaderRef([width, height]);
        
        for (const k in fields) {
          const {type, precision, range} = fields[k];
          
          if (type === 'DECIMAL') {
            const url = getURL(`${k}.png`);
            images.push(
              <ImageTexture
                key={url}
                url={url}
                pixelFormat='rgba8uint'
                colorSpace='linear'
                mip={false}
              />
            );
            mappers.push(makeValueMapper(precision));
            min.push(range.min);
            max.push(range.max);
          }
        }
        
        return (
          <Gather children={images} then={(images) => {
            if (images.some(i => !i)) return null;

            const sources = useMemo(() => {
              const intSources = images.map(img => ({
                ...img,
                layout: 'texture_2d<u32>',
                format: 'rgba8uint',
                variant: 'textureLoad',
                sampler: null,
              }));
              return intSources.map((source, i) => getShader(mappers[i], [source, absolute ? min[i] : 0]));
            }, [images]);
            
            const valueTexture = useShader(xyzwMapper, sources);
            const indexMapper = useShader(indexToXYMapper, [width]);
            
            const count = recordCount;
            const positions = useMemo(() => chainTo(indexMapper, valueTexture), [indexMapper, valueTexture]);

            return useRenderProp(props, {count, positions});
          }} />
        );
      }}
    </Fetch>
  );
};
