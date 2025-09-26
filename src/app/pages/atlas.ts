import { LiveComponent } from '@use-gpu/live/types';

import { gather, use, resume, useMemo, useOne, useResource, useState } from '@use-gpu/live';

import {
  Draw, Pass,
  Flat, UI, Layout, Absolute, Inline, Text,
  DebugAtlas, RawTexture,
} from '@use-gpu/components';

import { makeTexture } from '../meshes/mesh';

export type AtlasPageProps = {
  _unused?: boolean,
};

export const AtlasPage: LiveComponent<AtlasPageProps> = (props) => {
  const texture = makeTexture();

  return (
    use(Draw)({
      children:

        use(Pass)({
          children:

            gather([
              use(RawTexture)({ data: texture }),
            ], resume(([texture]: [TextureSource]) =>

                use(Flat)({
                  children: [

                    use(UI)({
                      children: 

                        use(Layout)({
                          children:
                            use(Absolute)({
                              left: 0,
                              bottom: 0,
                              right: 0,
                              height: 400,
                              children: [

                                use(Inline)({
                                  align: 'justify',
                                  children: [
                      
                                    use(Text)({ size: 90, snap: true, content: "The quick brown fox jumps over the lazy dog".slice(0, 35) })
                    
                                  ],
                                }),

                              ],
                            }),
                        }),

                    }),
                

                    use(DebugAtlas)({texture}),
                
                  ],
                })
            )),
        }),
    })

  );
};
