import type { VirtualDraw } from '../pass/types';
import { use, useHooks, useNoHooks } from '@use-gpu/live';

import { useInspectHoverable } from '../hooks/useInspectable';
import { useVariantContext } from '../providers/pass-provider';
import { PassReconciler } from '../reconcilers/index';

const {quote} = PassReconciler;

export const useDraw = (props: VirtualDraw) => {
  const useVariants = useVariantContext();

  const hovered = useInspectHoverable();
  const memo = Object.values(props) as any[];
  memo.push(hovered);
  memo.push(useVariants);

  return useHooks(() => {

    const variants = useVariants(props, hovered);

    if (Array.isArray(variants)) {
      if (variants.length === 1) {
        const [component] = variants;
        return quote(use(component, props));
      }
      return quote(variants.map(component => use(component, props)));
    }
    else if (variants) {
      const component = variants;
      return quote(use(component, props));
    }
  }, memo);
};

export const useNoDraw = useNoHooks;
