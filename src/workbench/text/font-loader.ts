import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { Font, LazyFontSource } from '@use-gpu/glyph';

import { use, gather, keyed, yeet, useOne } from '@use-gpu/live';
import { toHash } from '@use-gpu/state';
import { parseWeight } from '@use-gpu/traits';
import { Fetch } from '../data';
import { FontProvider } from './providers/font-provider';

export type FontSource = {
  family: string,
  weight: string | number,
  style: string,

  src?: string,
  lazy?: LazyFontSource,
};

export type FontLoaderProps = {
  fonts?: FontSource[],
  children: LiveElement,
};

const NO_FONTS: FontSource[] = [];

export const FontLoader: LiveComponent<FontLoaderProps> = ({fonts = NO_FONTS, children}) => {

  const resources = useOne(
    () => fonts
      .map((source: FontSource) => {
        const key = toHash(source);
        
        const {family, style, weight} = source;
        const props = {
          family,
          style,
          weight: parseWeight(weight),
        };

        const {src, lazy} = source;
        if (src != null) {
          return keyed(Fetch, key, {
            url: src,
            type: 'arrayBuffer',
            render: (buffer: ArrayBuffer) => yeet({ props, buffer }),
          })
        }
        if (lazy != null) {
          return yeet({ props, lazy });
        }
      }),
    fonts,
  );

  return gather(resources, (fonts: Font[]) => {
    return use(FontProvider, { fonts, children })
  });
};
