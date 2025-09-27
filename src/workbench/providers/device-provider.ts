import { makeContext, useContext } from '../../live';

export const DeviceContext = makeContext<GPUDevice>(undefined, 'DeviceContext');

export const useDeviceContext = () => useContext(DeviceContext);
