import type { LiveComponent, LiveFiber, LiveElement } from '@use-gpu/live';
import type { LambdaSource, TextureSource } from '@use-gpu/core';

import React from 'react';
import { memo, use, wrap, provide, useFiber, useMemo, useOne } from '@use-gpu/live';

import { proxy, splitCubeTexture, splitHistoryTexture } from '@use-gpu/core';
import { LiveCanvas } from '@use-gpu/react';
import { AutoCanvas } from '@use-gpu/webgpu';
import {
  LinearRGB, Pass, FlatCamera,
  FontLoader, Queue, QueueReconciler, DeviceContext,
  getShader, getLambdaSource, getDisplayShader,
} from '@use-gpu/workbench';
import { UI, Layout, Flex, Block, Inline, Text, Overflow, Absolute } from '@use-gpu/layout';
import { wgsl, chainTo } from '@use-gpu/shader/wgsl';
import { getObjectKey } from '@use-gpu/state';

import { UseInspect } from '@use-gpu/inspect';
import { inspectGPU } from './index';

import { displayCubeColor } from '@use-gpu/wgsl/display/cube-color.wgsl';
import { displayCubeDepth } from '@use-gpu/wgsl/display/cube-depth.wgsl';

const {signal} = QueueReconciler;

const SIZE = 512;
const HEIGHT = SIZE + 24 * 2 + 24;
const IMAGE_FIT = {fit: 'contain', align: 'center', repeat: 'none'};
const WRAPPER_STYLE = {position: 'relative', height: HEIGHT};

const NO_OPS: any[] = [];
const toArray = <T,>(x?: T | T[]): T[] => Array.isArray(x) ? x.filter(x => x != null) : x ? [x] : NO_OPS;

const backgroundColor = [0, 0, 0, 0];

type TargetsProps = {
  fiber: LiveFiber<any>,
};

type ViewProps = TexturesProps & {
  canvas: HTMLCanvasElement,
  device: GPUDevice,
};

type TexturesProps = {
  sources: TextureSource[],
};

const NO_TARGETS: TextureSource[] = []

export const renderTargets = (props: any) => <Targets {...props} />;

export const Targets: React.FC<TargetsProps> = ({fiber}) => {

  const output = fiber.__inspect?.output ?? ({} as any);
  const device = fiber.context.values.get(DeviceContext)?.current;

  // TODO: deprecate color/picking/depth
  const {color, picking, depth, source, sources} = output;

  const allSources = React.useMemo(() => {
    const toArray = <T,>(t?: T | T[]) => t ? Array.isArray(t) ? t : [t] : [];
    return [...toArray(color), ...toArray(picking), ...toArray(depth), ...toArray(source), ...toArray(sources)];
  }, [color, picking, depth, source, sources]);

  return (
    <div style={WRAPPER_STYLE}>
      <LiveCanvas>
        {(canvas: HTMLCanvasElement) => use(View, {canvas, device, sources: allSources})}
      </LiveCanvas>
    </div>
  );
};

const View: LiveComponent<ViewProps> = ({canvas, device, sources}) => (
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
          use(Inner, {canvas, sources}),
        ])
      )
    ),
  })
);

const Inner: LiveComponent<ViewProps> = memo(({canvas, sources}: ViewProps) => (
  use(AutoCanvas, {
    backgroundColor,
    canvas,
    test: true,
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
                    children: use(TextureViews, {sources}),
                  }))))))))
    ],
  })
), 'Inner');

const TextureViews: LiveComponent<TexturesProps> = memo((props: TexturesProps) => {
  const {sources} = props;

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
    
    const id = t.id ?? getObjectKey(t.view ?? t.texture);

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
                      children: label,
                    })
                  }),
                  use(Inline, {
                    children: use(Text, {
                      color: '#ffffff',
                      lineHeight: 24,
                      size: 16,
                      children: s,
                    })
                  }),
                ],
              }),
              use(Flex, {
                align: 'justify',
                children: [
                  use(Inline, {
                    children: use(Text, {
                      color: '#cccccc',
                      weight: 'bold',
                      lineHeight: 24,
                      size: 14,
                      children: subtype,
                    })
                  }),
                  use(Inline, {
                    children: use(Text, {
                      color: '#808080',
                      weight: 'bold',
                      lineHeight: 24,
                      size: 14,
                      children: `#${id}`,
                    })
                  }),
                ],
              }),
            ],
          })
        ]
      })
    )
  };
  
  const makeViews = (texture: TextureSource) => {
    const {layout, format, history} = texture;

    const isCube = layout.match(/cube/);
    const isDepth = layout.match(/depth/);
    const hasStencil = format?.match(/stencil/);

    const out = [];

    if (history) return splitHistoryTexture(texture).flatMap(makeViews);

    if (isCube) {
      let t = texture;
      t = getShader(isDepth ? displayCubeDepth : displayCubeColor, [t]);
      t = getLambdaSource(t, texture);
      out.push(makeView(t));

      const faces = splitCubeTexture(texture).map(getDisplayShader);
      out.push(faces.map(makeView));
    }
    else {
      const t = getDisplayShader(texture);
      out.push(makeView(t));
    }

    if (format.match(/rgba/)) {
      const label = [texture.label, texture.texture?.label, texture.view?.label, 'Alpha'].filter(l => l?.length).join(' ');
      let ts = proxy(texture, {
        hint: 'alpha',
        label,
      });
      const t = getDisplayShader(ts);
      out.push(makeView(t));
    }
    
    if (hasStencil) {
      const label = [texture.label, texture.texture?.label, texture.view?.label, 'Stencil'].filter(l => l?.length).join(' ');
      let ts = proxy(texture, {
        view: texture.texture?.createView({ aspect: 'stencil-only' }),
        layout: 'texture_2d<u32>',
        aspect: 'stencil-only',
        sampler: null,
        hint: 'stencil',
        label,
      });
      const t = getDisplayShader(ts);
      out.push(makeView(t));
    }

    return out;
  };

  return useOne(() => sources.filter(s => !!s).flatMap(makeViews), sources);
}, 'TextureViews');
