import { makeContext, useContext, useNoContext } from '../../live';

export const DeviceContext = makeContext<GPUDevice>(undefined, 'DeviceContext');

export const useDeviceContext = () => useContext(DeviceContext);
export const useNoDeviceContext = () => useNoContext(DeviceContext);
