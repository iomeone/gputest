import type { LiveComponent, LiveElement } from '../../live';
import type { Font } from '../../glyph';
import type { FontSource } from './types';

import { use, gather, keyed, yeet, useOne } from '../../live';
import { toHash } from '../../state';
import { parseWeight } from '../../traits';
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
