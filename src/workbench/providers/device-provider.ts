import { makeContext, useContext } from '@use-gpu/live';

export const DeviceContext = makeContext<GPUDevice>(undefined, 'DeviceContext');

export const useDeviceContext = () => useContext(DeviceContext);
