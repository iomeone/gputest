import React from 'react';
import type { LC, LiveElement, PropsWithChildren } from '@use-gpu/live';

import { provide, wrap, useAwait, useOne } from '@use-gpu/live';
import { Queue, DeviceContext } from '@use-gpu/workbench';

import { mountGPUDevice } from '../web';

export type ErrorRenderer = (e: Error) => LiveElement;

export type WebGPUProps = {
  fallback: LiveElement | ErrorRenderer,
};

export const WebGPU: LC<WebGPUProps> = ({fallback, children}: PropsWithChildren<WebGPUProps>) => {
  const [result, error] = useAwait(() => mountGPUDevice([], ["rg11b10ufloat-renderable", "depth32float-stencil8"]));
  return (
    result ? provide(DeviceContext, result.device, wrap(Queue, children)) :
    error ? (typeof fallback === 'function' ? fallback(error) : fallback) : null
  );
};
