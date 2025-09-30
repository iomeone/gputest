import { useState, useCallback, incrementVersion } from '@use-gpu/live';

export const useForceUpdate = (): [number, () => void] => {
  const [version, setVersion] = useState<number>(0);
  const updateVersion = useCallback(() => setVersion(incrementVersion));
  return [version, updateVersion];
};
