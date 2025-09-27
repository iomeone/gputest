import { useFiber, useState } from '@use-gpu/live';

export const useInspectable = () => {
  const fiber = useFiber();
  const inspect = fiber.__inspect = fiber.__inspect || {};

  const [hovered, setHovered] = useState<boolean>(false);
  if (!inspect.setHovered) {
    fiber.__inspect.setHovered = setHovered;
  }
  
  return hovered;
}

