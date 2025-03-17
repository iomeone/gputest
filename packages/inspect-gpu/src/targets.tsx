import type { LiveComponent, LiveElement, LiveFiber } from '@use-gpu/live';
import type { LambdaSource, TextureSource, TextureTarget } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import React, { FC, CSSProperties } from 'react';
import { memo, use, wrap, provide, useFiber, useOne } from '@use-gpu/live';

import { proxy, splitCubeTexture, splitHistoryTexture, notEmptyString } from '@use-gpu/core';
import { LiveCanvas } from '@use-gpu/react';
import { AutoCanvas } from '@use-gpu/webgpu';
import {
  LinearRGB, Pass, FlatCamera,
  FontLoader, Queue, QueueReconciler, DeviceContext,
  getShader, getLambdaSource, getDisplayShader,
} from '@use-gpu/workbench';
import { UI, Layout, Flex, Block, Inline, Text, Overflow, Absolute } from '@use-gpu/layout';
import { getObjectKey } from '@use-gpu/state';

import { UseInspect } from '@use-gpu/inspect';
import { inspectGPU } from './index';

import { displayCubeColor } from '@use-gpu/wgsl/display/cube-color.wgsl';
import { displayCubeAlpha } from '@use-gpu/wgsl/display/cube-alpha.wgsl';
import { displayCubeDepth } from '@use-gpu/wgsl/display/cube-depth.wgsl';

const {signal} = QueueReconciler;

const SIZE = 512;
const HEIGHT = SIZE + 24 * 2 + 24;
const IMAGE_FIT = {fit: 'contain', align: 'center', repeat: 'none'};
const WRAPPER_STYLE: CSSProperties = {position: 'relative', height: HEIGHT};

const backgroundColor = [0, 0, 0, 0];

type TargetsProps = {
  fiber: LiveFiber<any>,
};

type ViewProps = TexturesProps & {
  canvas: HTMLCanvasElement,
  device: GPUDevice,
};

type TexturesProps = {
  sources: TextureTarget[],
};

export const renderTargets = (props: any) => <Targets {...props} />;

export const Targets: FC<TargetsProps> = ({fiber}) => {

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

  const makeView = (texture: ShaderSource) => {
    const {size} = texture as LambdaSource;
    const [w, h] = size ?? [1, 1];
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
  
  const makeTextureLabel = (
    texture: TextureTarget | TextureSource,
    suffix: string,
  ) => {
    const mainLabel = notEmptyString(texture?.label) ?? notEmptyString(texture?.view?.label) ?? notEmptyString(texture?.texture?.label);
    return [mainLabel, suffix].filter(l => l?.length).join(' ');
  };

  const makeViews = (texture: TextureTarget | TextureSource): LiveElement[] => {
    const {layout, format, history} = texture as TextureTarget;

    const isCube = layout.match(/cube/);
    const isDepth = layout.match(/depth/);
    const hasStencil = format?.match(/stencil/);

    const out = [];

    if (history) return splitHistoryTexture(texture as TextureTarget).flatMap(makeViews);

    if (isCube) {
      let t = texture as ShaderSource;
      const s = getShader(isDepth ? displayCubeDepth : displayCubeColor, [t]);
      t = getLambdaSource(s, texture);
      out.push(makeView(t));

      if (format.match(/rgba/)) {
        const label = makeTextureLabel(texture, 'Alpha');
        const ts = proxy(texture, {
          hint: 'alpha',
          label,
        });
        const s = getShader(displayCubeAlpha, [ts]);
        t = getLambdaSource(s, ts);
        out.push(makeView(t));
      }

      const faces = splitCubeTexture(texture).map(getDisplayShader);
      out.push(faces.map(makeView));

    }
    else {
      const t = getDisplayShader(texture);
      out.push(makeView(t));

      if (format.match(/rgba/)) {
        const label = makeTextureLabel(texture, 'Alpha');
        const ts = proxy(texture, {
          hint: 'alpha',
          label,
        });
        const t = getDisplayShader(ts);
        out.push(makeView(t));
      }
    
      if (hasStencil) {
        const label = makeTextureLabel(texture, 'Stencil');
        const ts = proxy(texture, {
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
    }

    return out;
  };

  return useOne(() => sources.filter(s => !!s).flatMap(makeViews), sources);
}, 'TextureViews');
