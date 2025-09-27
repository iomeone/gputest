import { LiveComponent } from '../../live/types';
import { FontSource } from '../../text/types';

import { use, gather, keyed, yeet, useOne } from '../../live';
import { getHash } from '../../state';
import { Fetch } from '../data';
import { FontProvider } from './providers/font-provider';

export type FontLoaderProps = {
  fonts: FontSource[],
  children: LiveElement<any>,
};

export const FontLoader: LiveComponent<FontLoaderProps> = ({fonts, children}) => {

  const resources = useOne(() => fonts.map((source: FontSource) =>
    keyed(Fetch, getHash(source), {
      url: source.src,
      type: 'buffer',
      render: (buffer: ArrayBuffer) => yeet({props: source, buffer}),
    })
  ), fonts);

  return gather(resources, (fonts: Font[]) =>
    use(FontProvider, { fonts, children })
  );
};
