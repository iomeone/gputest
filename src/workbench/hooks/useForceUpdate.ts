import { useState, useCallback, incrementVersion } from '../../live';

export const useForceUpdate = (): [number, () => void] => {
  const [version, setVersion] = useState<number>(0);
  const updateVersion = useCallback(() => setVersion(incrementVersion));
  return [version, updateVersion];
};
