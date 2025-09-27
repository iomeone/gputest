import React from 'react';
import type { LC, LiveElement } from '@use-gpu/live';

import { provide, wrap, useAsync, useOne } from '@use-gpu/live';
import { DeviceContext } from '@use-gpu/workbench';//'/providers/device-provider'

import { mountGPUDevice } from '../web';

export type ErrorRenderer = (e: Error) => LiveElement<any>;

export type WebGPUProps = {
  fallback: LiveElement<any> | ErrorRenderer,
};

export const WebGPU: LC<WebGPUProps> = ({fallback, children}) => {
  const [result, error] = useAsync(mountGPUDevice);
  return (
    result ? provide(DeviceContext, result.device, children) :
    error ? (typeof fallback === 'function' ? fallback(error) : fallback) : null
  );
};
