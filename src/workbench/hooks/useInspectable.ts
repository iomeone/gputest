import { useCallback, useOne, useFiber, useState } from '@use-gpu/live';

export type Inspector = (data: Record<string, any>) => void;

export const useInspectable = () => {
  const fiber = useFiber();

  const inspected = fiber.__inspect = fiber.__inspect || {};
  const inspect = useOne(() => (data: Record<string, any>) => {
    for (const key in data) inspected[key] = data[key];
    return fiber.__inspect as Record<string, any>;
  });

  return inspect;
}

export const useInspectHoverable = () => {
  const fiber = useFiber();
  const inspect = fiber.__inspect = fiber.__inspect || {};

  const [hovered, setHovered] = useState<boolean>(false);
  if (!inspect.setHovered) {
    fiber.__inspect.setHovered = setHovered;
  }
  
  return hovered;
}

const NOP = () => {};
export const useInspectorSelect = () => {
  const fiber = useFiber();
  const highlight = fiber.host?.__highlight ?? NOP;
  return highlight;
}
