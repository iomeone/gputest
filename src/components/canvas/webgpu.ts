import React from 'react';

import { FC, provide, wrap, useAsync } from '@use-gpu/live';
import { mountGPUDevice } from '@use-gpu/webgpu';

import { HTML } from '@use-gpu/react';
import { DeviceContext } from '../providers/device-provider';

type ErrorRenderer = (e: Error) => LiveElement<any>;

type WebGPUProps = {
  fallback: LiveElement<any> | ErrorRenderer,
};

export const WebGPU: FC<WebGPUProps> = ({fallback, children}) => {
  const [result, error] = useAsync(mountGPUDevice);
  console.log({result, error})
  return (
    result ? provide(DeviceContext, result.device, children) :
    error ? (typeof fallback === 'function' ? fallback(error) : fallback) : null
  );
};
