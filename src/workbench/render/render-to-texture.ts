import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { UseGPURenderContext, TextureTarget } from '@use-gpu/core';

import { provide, yeet, useMemo, incrementVersion } from '@use-gpu/live';
import { RenderContext, useRenderContext, useNoRenderContext } from '../providers/render-provider';
import { QueueReconciler } from '../reconcilers/index';

import { getRenderFunc } from '../hooks/useRenderProp';

const {quote} = QueueReconciler;

export type RenderToTextureProps = {
  target?: UseGPURenderContext,
  render?: (texture: TextureTarget) => LiveElement,
  children?: LiveElement | ((texture: TextureTarget) => LiveElement),
};

/** Render to a given off-screen target, or the current target (if inside a `@{<RenderTarget>}`). */
export const RenderToTexture: LiveComponent<RenderToTextureProps> = (props: RenderToTextureProps) => {
  const {
    target,
    children,
  } = props;

  const renderContext = target ? (useNoRenderContext(), target) : useRenderContext();
  const {source} = renderContext;
  if (!source) throw new Error("No render target provided or in use");

  const trigger = useMemo(() => quote(yeet(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    source!.version = incrementVersion(source!.version);
  })), [source]);

  const render = getRenderFunc(props);
  const view = render ? render(source) : children;

  return [trigger, provide(RenderContext, renderContext, view)];
};
