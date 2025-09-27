import { makeContext, useContext } from '../../live';

export const DeviceContext = makeContext(undefined, 'DeviceContext');

export const useDeviceContext = () => useContext(DeviceContext);