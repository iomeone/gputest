import type { LiveFiber } from './types';

// Hide the fiber argument like in React
export let CURRENT_FIBER = null as LiveFiber<any> | null;
export const getCurrentFiber = () => CURRENT_FIBER!;
export const getCurrentFiberID = () => CURRENT_FIBER?.id;
export const setCurrentFiber = (f: LiveFiber<any> | null) => CURRENT_FIBER = f;
