import type { LC } from '@use-gpu/live';
import type { ExtendedPassFlags, RenderComponents, VirtualDraw } from './types';
import { useMemo } from '@use-gpu/live';

type Variants = LC | LC[] | null | undefined;

const HOVERED_VARIANT = 'debug';

// Provide draw call variants for sub-passes
export const makeGetVariants = (
  components: RenderComponents,
  flags: ExtendedPassFlags,
) => {
  const {normals, shadows, picking} = flags;

  const getRender = (mode: string, render: string | null = null): LC | null | undefined =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    components.renders[render!]?.[mode] ?? components.modes[mode];

  const getVariants = (!normals && !shadows && !picking)
     ? (virtual: VirtualDraw, hovered: boolean): Variants =>
       hovered ? [getRender(HOVERED_VARIANT)!] : getRender(virtual.mode, virtual.renderer)

     : (virtual: VirtualDraw, hovered: boolean): Variants => {
        const {mode, renderer, links, defines} = virtual;

        const variants = [];
        if (normals && mode === 'opaque' && defines?.HAS_SHADOW) {
          variants.push('normal');
        }
        if (shadows && mode === 'opaque' && defines?.HAS_SHADOW) {
          variants.push('shadow');
        }
        if (picking && mode !== 'picking' && links?.getPicking) {
          variants.push('picking');
        }
        if (variants.length === 0) return hovered ? getRender(HOVERED_VARIANT) : getRender(mode, renderer);

        variants.push(hovered ? HOVERED_VARIANT : mode);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return variants.map(mode => getRender(mode, renderer)!);
      };
  
  return getVariants;
};

export const useMakeUseVariants = (
  components: RenderComponents,
  flags: ExtendedPassFlags,
) => {
  const {normals, shadows, picking} = flags;
  
  return useMemo(() => {
    const getVariants = makeGetVariants(components, flags);
    return (virtual: VirtualDraw, hovered: boolean) =>
      // eslint-disable-next-line react-hooks/exhaustive-deps
      useMemo(() => getVariants(virtual, hovered), [getVariants, virtual, hovered]);
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components, normals, shadows, picking]);
};
