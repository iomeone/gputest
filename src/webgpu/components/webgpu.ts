import type { LC, LiveElement, PropsWithChildren } from '@use-gpu/live';

import { provide, wrap, useAwait, useResource } from '@use-gpu/live';
import { Queue, DeviceContext } from '@use-gpu/workbench';

import { mountGPUDevice } from '../web';

const REQUIRED_EXTENSIONS: GPUFeatureName[] = [];
const OPTIONAL_EXTENSIONS: GPUFeatureName[] = ["rg11b10ufloat-renderable", "depth32float-stencil8", "shader-f16"];

export type ErrorRenderer = (e: Error) => LiveElement;

export type WebGPUProps = PropsWithChildren<{
  required?: GPUFeatureName[],
  optional?: GPUFeatureName[],
  fallback: LiveElement | ErrorRenderer,
}>;

export const WebGPU: LC<WebGPUProps> = (props: WebGPUProps) => {
  const {
    required = REQUIRED_EXTENSIONS,
    optional = OPTIONAL_EXTENSIONS,
    fallback,
    children,
  } = props;

  const [result, error] = useAwait(() => mountGPUDevice(required, optional), [...required, null, ...optional]);
  useResource((dispose) => {
    if (!result) return;

    const {device} = result;
    const handler = (event: any) => {
      console.error(event.error.message);
    };

    device.addEventListener('uncapturederror', handler);
    dispose(() => device.addEventListener('uncapturederror', handler));
  }, [result]);
  return (
    result ? provide(DeviceContext, result.device, wrap(Queue, children)) :
    error ? (typeof fallback === 'function' ? fallback(error) : fallback) : null
  );
};
