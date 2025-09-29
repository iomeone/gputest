import type { LiveComponent, LiveFiber, LiveElement } from '@use-gpu/live';
import type { LambdaSource, TextureSource } from '@use-gpu/core';

import { memo, use, wrap, provide, signal, useFiber, useMemo, useOne, makeContext } from '@use-gpu/live';
import { LiveCanvas } from '@use-gpu/react';
import { wgsl } from '@use-gpu/shader/wgsl';
import { Pass, Flat, FontLoader, Queue, DeviceContext, getBoundShader, getLambdaSource } from '@use-gpu/workbench';
import { AutoCanvas } from '@use-gpu/webgpu';
import { UI, Layout, Flex, Block, Inline, Text, Overflow, Absolute } from '@use-gpu/layout';

import { styled as _styled } from '@stitches/react';

import React, { Fragment } from 'react';

import { UseInspect } from '@use-gpu/inspect';
import { inspectGPU } from '.';

import { decodeOctahedral } from '@use-gpu/wgsl/codec/octahedral.wgsl';

const NO_OPS: any[] = [];
const toArray = <T,>(x?: T | T[]): T[] => Array.isArray(x) ? x : x ? [x] : NO_OPS; 

const backgroundColor = [0, 0, 0, 0.1];
const styled: any = _styled;

//const StyledShader = styled('div', {
//});

const arrayShader = wgsl`
  @link fn getIndex() -> u32;
  @link fn getTexture(uv: vec2<i32>, index: u32, level: u32) -> vec4<f32>;

  fn main(uv: vec2<i32>, level: u32) -> vec4<f32> { return getTexture(uv, getIndex(), level); }
`;

const depthCubeShader = wgsl`
  @link fn decodeOctahedral(o: vec2<f32>) -> vec3<f32>;
  @link fn getTexture(uv: vec3<f32>) -> vec4<f32>;

  fn main(uv: vec2<f32>) -> vec4<f32> {
    var uvw: vec3<f32> = decodeOctahedral(uv * 2.0 - 1.0);

    let t = getTexture(uvw);

    let a = abs(uvw);
    var b: vec2<f32>;
    
    var tint = vec3<f32>(0.0, 0.0, 0.0);
    if (a.x > a.y) {
      if (a.x > a.z) {
        b = uvw.yz / a.x;
        if (uvw.x > 0.0) {
          tint.r += 1.0;
        }
        else {
          tint.r += 1.0;
          tint.g += 0.5;
        }
      }
      else {
        b = uvw.xy / a.z;
        if (uvw.z > 0.0) {
          tint.b += 1.0;
          tint.g += 0.25;
        }
        else {
          tint.b += 1.0;
          tint.r += 0.5;
          tint.g += 0.25;
        }
      }
    }
    else {
      if (a.y > a.z) {
        b = uvw.xz / a.y;
        if (uvw.y > 0.0) {
          tint.g += 1.0;
        }
        else {
          tint.g += 1.0;
          tint.b += 0.5;
        }
      }
      else {
        b = uvw.xy / a.z;
        if (uvw.z > 0.0) {
          tint.b += 1.0;
          tint.g += 0.25;
        }
        else {
          tint.b += 1.0;
          tint.r += 0.5;
          tint.g += 0.25;
        }
      }
    }
    let border = clamp(50.0 * (max(abs(b.x), abs(b.y)) - 0.9), 0.0, 1.0);
    
    let depth = select(0.0, -log(t.x), t.x > 0.0);
    return mix(vec4<f32>(fract(depth), fract(depth * 16.0) * .75, fract(depth * 256.0), 1.0), vec4<f32>(tint, 1.0), border * 0.5);
  }
`;

const pickingShader = wgsl`
  @link fn getSize() -> vec2<f32>;
  @link fn getPicking(uv: vec2<i32>, level: i32) -> vec4<u32>;

  fn main(uv: vec2<f32>) -> vec4<f32> {
    let iuv = vec2<i32>(uv * getSize());
    let pick = vec2<f32>(getPicking(iuv, 0).xy);

    let a = (pick.r / 16.0) % 1.0;
    let b = (pick.g / 16.0) % 1.0;
    let c = (pick.r + pick.g) / 256.0;
    return sqrt(vec4<f32>(a, c, b, 1.0));
  }
`;

const stencilShader = wgsl`
  @link fn getSize() -> vec2<f32>;
  @link fn getStencil(uv: vec2<i32>, level: i32) -> vec4<u32>;

  fn main(uv: vec2<f32>) -> vec4<f32> {
    let iuv = vec2<i32>(uv * getSize());
    let stencil = getStencil(iuv, 0).x;

    let a = (f32(stencil) / 256.0) % 1.0;
    let b = (f32(stencil) / 64.0) % 1.0;
    let c = (f32(stencil) / 16.0) % 1.0;
    return sqrt(vec4<f32>(a, c, b, 1.0));
  }
`;

const depthShader = wgsl`
  @link fn getSize() -> vec2<f32>;
  @link fn getDepth(uv: vec2<i32>, level: i32) -> vec4<f32>;

  fn main(uv: vec2<f32>) -> vec4<f32> {
    let iuv = vec2<i32>(uv * getSize());
    let depth = getDepth(iuv, 0).x;

    var d = 0.5;
    if (depth > 0.0) { d = -log(depth); }
    return vec4<f32>(fract(d), fract(d * 16.0) * .75, fract(d * 256.0), 1.0);
  }
`;

type TargetsProps = {
  fiber: LiveFiber<any>,
};

type ViewProps = TexturesProps & {
  canvas: HTMLCanvasElement,
  device: GPUDevice,
};

type TexturesProps = {
  color?: TextureSource | TextureSource[],
  depth?: TextureSource | TextureSource[],
  picking?: TextureSource | TextureSource[],
};

export const renderTargets = (props: any) => <Targets {...props} />;

export const Targets: React.FC<TargetsProps> = ({fiber}) => {
  
  const {color, picking, depth} = fiber.__inspect?.output;
  const device = fiber.context.values.get(DeviceContext)?.current;

  return (
    <div style={{height: 546, position: 'relative'}}>
      <LiveCanvas>
        {(canvas: HTMLCanvasElement) => use(View, {canvas, device, color, picking, depth})}
      </LiveCanvas>
    </div>
  );
};

const View: LiveComponent<ViewProps> = ({canvas, device, color, picking, depth}) => (
  use(UseInspect, {
    sub: 'targets',
    container: canvas.parentNode,
    active: true,
    fiber: useFiber(),
    extensions: useOne(() => [inspectGPU], inspectGPU),
    children: (
      provide(DeviceContext, device,
        wrap(Queue, [
          signal(),
          use(Inner, {canvas, device, color, picking, depth}),
        ])
      )
    ),
  })
);

const Inner: LiveComponent<ViewProps> = memo(({canvas, color, picking, depth}: ViewProps) => (
  use(AutoCanvas, {
    backgroundColor,
    canvas,
    children: [
      wrap(FontLoader,
        wrap(Flat,
          wrap(Pass,
            wrap(UI,
              wrap(Layout,
                wrap(Absolute, use(Overflow, {
                  x: 'auto',
                  direction: 'x',
                  children: use(TextureViews, {color, picking, depth}),
                })))))))
    ]
  })
), 'Inner');

const TextureViews: LiveComponent<TexturesProps> = memo((props: TexturesProps) => {
  const {color, picking, depth} = props;

  const makeView = (texture: TextureSource | LambdaSource) => {
    const {size: [w, h]} = texture;
    const width = w > h ? 512 : Math.round(w/h * 512);
    const height = w > h ? Math.round(h/w * 512) : 512;

    return (
      use(Block, {
        children: [
          use(Block, {
            border: 1,
            stroke: '#808080',
            width, height,
            fill: [0, 0, 0, .5],
            image: {texture, fit: 'contain', align: 'center', repeat: 'none'},
          }),
          use(Inline, {
            children: use(Text, {
              color: 0xffffff,
              lineHeight: 24,
              size: 16,
              children: `${(texture as any).layout} – ${(texture as any).format}`,
            })
          })
        ]
      })
    )
  };

  const colorViews = useMemo(() => {
    const out: LiveElement[] = [];

    for (let t of [...toArray(color), ...toArray(depth)]) {
      const {layout, format, size, aspect = 'all'} = t;

      if (layout.match(/depth/) || format.match(/depth/)) {
        t = {
          ...t,
          comparison: false,
          sampler: null,
          aspect: 'depth-only',
          variant: 'textureLoad',
        };

        if (aspect !== 'stencil-only') {
          if (layout.match(/cube_array/)) {
            console.warn("TODO: inspect depth cube array");
          }
          else if (layout.match(/cube/)) {
            {
              let texture = {...t, sampler: {}, variant: 'textureSample'} as any;
              texture = getBoundShader(depthCubeShader, [decodeOctahedral, texture]);
              texture = getLambdaSource(texture, t);
              texture.format = t.format;
              texture.layout = t.layout;
              out.push(makeView(texture));
            }

            {
              for (let i = 0; i < 6; ++i) {
                let texture = {...t, layout: 'texture_2d_array<f32>'} as any;
                texture = getBoundShader(arrayShader, [i, texture]);
                texture = getBoundShader(depthShader, [() => size, texture]);
                texture = getLambdaSource(texture, t);
                texture.format = t.format;
                texture.layout = t.layout + ` (face ${i + 1})`;
                out.push(makeView(texture));
              }
            }
          }
          else if (layout.match(/array/)) {
            const [,, depth] = size;
            for (let i = 0; i < depth!; ++i) {
              let texture = t as any;
              texture = getBoundShader(arrayShader, [i, texture]);
              texture = getBoundShader(depthShader, [() => size, texture]);
              texture = getLambdaSource(texture, t);
              texture.format = t.format;
              texture.layout = t.layout;
              out.push(makeView(texture));
            }
          }
          else if (layout.match(/multisampled/)) {
            let texture = t as any;
            texture = getBoundShader(depthShader, [() => size, texture]);
            texture = getLambdaSource(texture, t);
            texture.format = t.format;
            texture.layout = t.layout;
            out.push(makeView(texture));
          }
          else {
            let texture = t as any;
            texture = getBoundShader(depthShader, [() => size, texture]);
            texture = getLambdaSource(texture, t);
            texture.format = t.format;
            texture.layout = t.layout;
            out.push(makeView(texture));
          }
        }
      }
      else {
        if (layout.match(/multisampled/)) {
          console.warn("TODO: inspect multisampled 2d texture");
        }
        else if (layout.match(/array/)) {
          console.warn("TODO: inspect 2d array texture");
        }
        else {
          out.push(makeView(t));
        }
      }

      if (format.match(/stencil/) && aspect !== 'depth-only') {
        t = {
          ...t,
          sampler: null,
          layout: 'texture_2d<u32>',
          variant: 'textureLoad',
          aspect: 'stencil-only',
        };

        let texture = t as any;
        texture = getBoundShader(stencilShader, [() => size, texture]);
        texture = getLambdaSource(texture, t);
        texture.format = t.format;
        texture.layout = t.layout;
        out.push(makeView(texture));
      }
    }

    return out;
  }, [color, depth]);

  const pickingViews = useOne(() => {
    const out: LiveElement[] = [];
    for (let t of toArray(picking)) {
      const {size} = t;

      let texture = getBoundShader(pickingShader, [() => size, t]) as any;
      texture = getLambdaSource(texture, t);

      out.push(makeView(texture));
    }
    return out;
  }, picking);

  const view: LiveElement[] = useMemo(() => [
    ...colorViews,
    ...pickingViews,
  ], [colorViews, pickingViews]);

  return view;
}, 'TextureViews');
