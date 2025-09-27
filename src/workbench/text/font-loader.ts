import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { Font } from '@use-gpu/glyph';
import type { FontSource } from './types';

import { use, gather, keyed, yeet, useOne } from '@use-gpu/live';
import { toHash } from '@use-gpu/state';
import { parseWeight } from '@use-gpu/traits';
import { Fetch } from '../data';
import { FontProvider } from './providers/font-provider';

export type FontLoaderProps = {
  fonts: FontSource[],
  children: LiveElement<any>,
};

export const FontLoader: LiveComponent<FontLoaderProps> = ({fonts, children}) => {

  const resources = useOne(() => fonts
    .filter((s: FontSource) => !!s.src)
    .map((source: FontSource) =>
      keyed(Fetch, toHash(source), {
        url: source.src,
        type: 'arrayBuffer',
        render: (buffer: ArrayBuffer) => yeet({props: {
          ...source,
          weight: parseWeight(source.weight),
        }, buffer}),
      })
    ),
    fonts);

  return gather(resources, (fonts: Font[]) => {
    return use(FontProvider, { fonts, children })
  });
};
