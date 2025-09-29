import type { LiveFiber, LiveComponent, LiveElement, ArrowFunction, PropsWithChildren } from '@use-gpu/live';
import type { UseGPURenderContext, ColorSpace, TextureTarget } from '@use-gpu/core';

import { use, provide, fence, quote, yeet, useCallback, useContext, useFiber, useMemo, useOne, useNoContext, incrementVersion } from '@use-gpu/live';
import { RenderContext } from '../providers/render-provider';
import { DeviceContext } from '../providers/device-provider';

import {
  makeColorState,
  makeColorAttachment,
  makeTargetTexture,
  makeDepthTexture,
  makeDepthStencilState,
  makeDepthStencilAttachment,
  BLEND_PREMULTIPLY,
} from '@use-gpu/core';

const seq = (n: number, start: number = 0, step: number = 1) => Array.from({length: n}).map((_, i) => start + i * step);

const NO_SAMPLER: Partial<GPUSamplerDescriptor> = {};

export type RenderToTextureProps = {
  target?: UseGPURenderContext,
  render?: (texture: TextureTarget) => LiveElement,
  then?: (texture: TextureTarget) => LiveElement,
};

/** Render to a given off-screen target, or the current target (if inside a `@{<RenderTarget>}`). */
export const RenderToTexture: LiveComponent<RenderToTextureProps> = (props: PropsWithChildren<RenderToTextureProps>) => {
  const device = useContext(DeviceContext);

  const {
    target,
    children,
    then,
  } = props;

  const renderContext = target ? (useNoContext(RenderContext), target) : useContext(RenderContext);
  const {source} = renderContext;
  if (!source) throw new Error("No render target provided or in use");

  const Done = () => {
    const run = () => {
      source!.version = incrementVersion(source!.version);
    };

    const view = quote(yeet(run));
    if (!then) return view;

    const children: LiveElement = [view];
    const c = then(source!);
    if (c) children.push(c);
    return children.length > 1 ? children : children[0];
  };

  if (!children && !then) return null;

  return (
    fence(
      target ? provide(RenderContext, renderContext, children) : children
    , Done)
  );
}
