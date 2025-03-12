import type { LiveComponent, LiveFiber, LiveElement } from '@use-gpu/live';
import type { LambdaSource, TextureSource } from '@use-gpu/core';

import React from 'react';
import { memo, use, wrap, provide, useFiber, useMemo, useOne } from '@use-gpu/live';

import { splitCubeTexture } from '@use-gpu/core';
import { LiveCanvas } from '@use-gpu/react';
import { AutoCanvas } from '@use-gpu/webgpu';
import {
  LinearRGB, Pass, FlatCamera,
  FontLoader, Queue, QueueReconciler, DeviceContext,
  getShader, getLambdaSource, getDisplayShader,
} from '@use-gpu/workbench';
import { UI, Layout, Flex, Block, Inline, Text, Overflow, Absolute } from '@use-gpu/layout';
import { wgsl, chainTo } from '@use-gpu/shader/wgsl';

import { UseInspect } from '@use-gpu/inspect';
import { inspectGPU } from './index';

import { decodeOctahedral } from '@use-gpu/wgsl/codec/octahedral.wgsl';

const {signal} = QueueReconciler;

const SIZE = 512;
const HEIGHT = SIZE + 24 * 2 + 24;
const IMAGE_FIT = {fit: 'contain', align: 'center', repeat: 'none'};

const NO_OPS: any[] = [];
const toArray = <T,>(x?: T | T[]): T[] => Array.isArray(x) ? x.filter(x => x != null) : x ? [x] : NO_OPS;

const backgroundColor = [0, 0, 0, 0];

const arrayShader = wgsl`
  @link fn getIndex() -> u32;
  @link fn getTexture(uv: vec2<i32>, index: u32, level: u32) -> vec4<f32>;

  fn main(uv: vec2<i32>, level: u32) -> vec4<f32> { return getTexture(uv, getIndex(), level); }
`;

const colorCubeShader = wgsl`
  @link fn decodeOctahedral(o: vec2<f32>) -> vec3<f32>;
  @link fn getTexture(uv: vec3<f32>) -> vec4<f32>;

  fn main(uv: vec2<f32>) -> vec4<f32> {
    var uvw: vec3<f32> = decodeOctahedral(uv * 2.0 - 1.0);

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

    let t = getTexture(uvw);
    return mix(t, vec4<f32>(tint, 1.0), border * 0.5);
  }
`;

const depthCubeShader = wgsl`
  @link fn decodeOctahedral(o: vec2<f32>) -> vec3<f32>;
  @link fn getTexture(uv: vec3<f32>) -> vec4<f32>;

  fn main(uv: vec2<f32>) -> vec4<f32> {
    var uvw: vec3<f32> = decodeOctahedral((uv * 2.0 - 1.0) * vec2<f32>(1.0, -1.0));

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

    var d = select(0.5, -log(depth), depth > 0.0);
    return vec4<f32>(fract(d), fract(d * 16.0) * .75, fract(d * 256.0), 1.0);
  }
`;

const uint32Shader = wgsl`
  @link fn getSize() -> vec2<f32>;
  @link fn getU16(uv: vec2<i32>, level: i32) -> vec4<u32>;

  fn main(uv: vec2<f32>) -> vec4<f32> {
    let iuv = vec2<i32>(uv * getSize());
    let uint = getU16(iuv, 0).xyz;

    return vec4<f32>(vec3<f32>(uint) / 4294967295.0, 1.0);
  }
`;

const uint16Shader = wgsl`
  @link fn getSize() -> vec2<f32>;
  @link fn getU16(uv: vec2<i32>, level: i32) -> vec4<u32>;

  fn main(uv: vec2<f32>) -> vec4<f32> {
    let iuv = vec2<i32>(uv * getSize());
    let uint = getU16(iuv, 0).xyz;

    return vec4<f32>(vec3<f32>(uint) / 65535.0, 1.0);
  }
`;

const uint8Shader = wgsl`
  @link fn getSize() -> vec2<f32>;
  @link fn getU16(uv: vec2<i32>, level: i32) -> vec4<u32>;

  fn main(uv: vec2<f32>) -> vec4<f32> {
    let iuv = vec2<i32>(uv * getSize());
    let uint = getU16(iuv, 0).xyz;

    return vec4<f32>(vec3<f32>(uint) / 255.0, 1.0);
  }
`;

const floatShader = wgsl`
  @link fn getSize() -> vec2<f32>;
  @link fn getF32(uv: vec2<f32>) -> vec4<f32>;

  fn main(uv: vec2<f32>) -> vec4<f32> {
    let fl = getF32(uv).xyz;
    return vec4<f32>(abs(vec3<f32>(fl)), 1.0);
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

  const output = fiber.__inspect?.output ?? ({} as any);
  const {color, picking, depth} = output;
  const device = fiber.context.values.get(DeviceContext)?.current;

  return (
    <div style={{height: HEIGHT, position: 'relative'}}>
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
        wrap(FlatCamera,
          wrap(LinearRGB,
            wrap(Pass,
              wrap(UI,
                wrap(Layout,
                  wrap(Absolute, use(Overflow, {
                    x: 'auto',
                    direction: 'x',
                    children: use(TextureViews, {color, picking, depth}),
                  }))))))))
    ]
  })
), 'Inner');

const TextureViews: LiveComponent<TexturesProps> = memo((props: TexturesProps) => {
  const {color, picking, depth} = props;

  const makeView = (texture: TextureSource | LambdaSource) => {
    const {size, size: [w, h, d]} = texture;
    const width = w > h ? SIZE : Math.round(w/h * SIZE);
    const height = w > h ? Math.round(h/w * SIZE) : SIZE;

    const t = texture as any;

    const label = t.texture?.label ?? t.label;
    const s = size.join('×');

    const parts: string[] = [];
  
    if (t.layout) parts.push(t.layout);
    if (t.format) parts.push(t.format);
    if (t.colorSpace) parts.push(t.colorSpace);

    const subtype = parts.join(' ');

    return (
      use(Block, {
        children: [
          use(Block, {
            border: 1,
            stroke: '#808080',
            width, height,
            fill: [0, 0, 0, 1],
            texture,
            image: IMAGE_FIT,
          }),
          use(Block, {
            padding: 4,
            children: [
              use(Flex, {
                align: 'justify',
                children: [
                  use(Inline, {
                    children: use(Text, {
                      color: '#ffffff',
                      lineHeight: 24,
                      size: 16,
                      weight: 'bold',
                      hint: 'y',
                      children: label,
                    })
                  }),
                  use(Inline, {
                    children: use(Text, {
                      color: '#ffffff',
                      lineHeight: 24,
                      size: 16,
                      hint: 'y',
                      children: s,
                    })
                  }),
                ],
              }),
              use(Inline, {
                children: use(Text, {
                  color: '#ffffff',
                  weight: 'bold',
                  lineHeight: 24,
                  size: 14,
                  hint: 'y',
                  children: subtype,
                })
              }),
            ],
          })
        ]
      })
    )
  };
  
  const makeViews = (texture: TextureSource) => {
    const {layout, history} = texture;
    if (history) return history.flatMap(t => makeViews(t));

    const isCube = layout.match(/cube/);
    const isDepth = layout.match(/depth/);

    const out = [];
    if (isCube) {

      let t = {...texture, sampler: {}, variant: 'textureSample'} as any;
      t = getShader(isDepth ? depthCubeShader : colorCubeShader, [decodeOctahedral, texture]);
      t = getLambdaSource(t, texture);
      out.push(makeView(t));

      const faces = splitCubeTexture(texture).map(getDisplayShader);
      console.log({faces})
      out.push(faces.map(makeView));
    }
    else {
      const t = getDisplayShader(texture);
      adoptMeta(t, texture);
      out.push(makeView(t));
    }

    return out;
  };

  const colorViews = useMemo(() => {
    
    const sources = [...toArray(color), ...toArray(depth)];
    return sources.flatMap(makeViews);
    
    const out: LiveElement[] = [];

    for (let t of [...toArray(color), ...toArray(depth)]) {
      const {layout, format, size, aspect = 'all'} = t;

      // depth, depth cube, depth array 
      if (layout.match(/depth/) || format.match(/depth/)) {
        t = {
          ...t,
          filter: 'non-filtering',
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
              texture = getShader(depthCubeShader, [decodeOctahedral, texture]);
              texture = getLambdaSource(texture, t);
              adoptMeta(texture, t);
              out.push(makeView(texture));
            }

            {
              for (let i = 0; i < 6; ++i) {
                let texture = {...t, layout: 'texture_2d_array<f32>'} as any;
                texture = getShader(arrayShader, [i, texture]);
                texture = getShader(depthShader, [() => size, texture]);
                texture = getLambdaSource(texture, t);
                adoptMeta(texture, t);
                texture.layout = t.layout + ` (face ${i + 1})`;
                out.push(makeView(texture));
              }
            }
          }
          else if (layout.match(/array/)) {
            const [,, depth = 0] = size;
            for (let i = 0; i < depth; ++i) {
              let texture = t as any;
              texture = getShader(arrayShader, [i, texture]);
              texture = getShader(depthShader, [() => size, texture]);
              texture = getLambdaSource(texture, t);
              adoptMeta(texture, t);
              out.push(makeView(texture));
            }
          }
          else {
            let texture = t as any;
            texture = getShader(depthShader, [() => size, texture]);
            texture = getLambdaSource(texture, t);
            adoptMeta(texture, t);
            out.push(makeView(texture));
          }
        }
      }
      
      // cube map v2
      else if (layout.match(/cube/)) {
        {
          let texture = {...t, sampler: {}, variant: 'textureSample'} as any;
          texture = getShader(colorCubeShader, [decodeOctahedral, texture]);
          texture = getLambdaSource(texture, t);
          adoptMeta(texture, t);
          out.push(makeView(texture));
        }

        const faces = splitCubeTexture(t).map(getDisplayShader);
        out.push(faces.map(makeView));
      }

      // color v2
      else {
        const texture = getDisplayShader(t);
        adoptMeta(texture, t);
        out.push(makeView(texture));
      }

      // stencil
      if (format.match(/stencil/) && aspect !== 'depth-only') {
        t = {
          ...t,
          sampler: null,
          layout: 'texture_2d<u32>',
          variant: 'textureLoad',
          aspect: 'stencil-only',
        };

        let texture = t as any;
        texture = getShader(stencilShader, [() => size, texture]);
        texture = getLambdaSource(texture, t);
        adoptMeta(texture, t);
        out.push(makeView(texture));
      }
    }

    return out;
  }, [color, depth]);

  const pickingViews = useOne(() => {
    const out: LiveElement[] = [];
    for (const t of toArray(picking)) {
      const {size} = t;

      let texture = getShader(pickingShader, [() => size, t]) as any;
      texture = getLambdaSource(texture, t);
      adoptMeta(texture, t);

      out.push(makeView(texture));
    }
    return out;
  }, picking);

  const view: LiveElement[] = useMemo(() => [
    ...pickingViews,
    ...colorViews,
  ], [colorViews, pickingViews]);

  return view;
}, 'TextureViews');

const adoptMeta = (texture: any, t: any) => {
  if (!texture.format) texture.format = t.format;
  if (!texture.layout) texture.layout = t.layout;
  if (!texture.label) texture.label  = [t.view?.label, t.texture?.label, t.view?.label].filter(s => s?.length).join(' ');
  if (!texture.colorSpace) texture.colorSpace = t.colorSpace;
};
