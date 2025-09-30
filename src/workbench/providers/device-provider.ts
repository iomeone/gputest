import { makeContext, useContext, useNoContext } from '@use-gpu/live';

export const DeviceContext = makeContext<GPUDevice>(undefined, 'DeviceContext');

export const useDeviceContext = () => useContext(DeviceContext);
export const useNoDeviceContext = () => useNoContext(DeviceContext);
