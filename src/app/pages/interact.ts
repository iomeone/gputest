import { LiveComponent } from '@use-gpu/live/types';
import { TextureSource } from '@use-gpu/core/types';

import { use, gather, resume, useMemo, useOne, useResource, useState } from '@use-gpu/live';

import {
  Draw, Pass,
  Flat, Absolute, Layout, Block, Flex, Element,
  Aggregate, RawTexture,
} from '@use-gpu/components';
import { makeTexture } from '../meshes/mesh';

export type InteractPageProps = {
  _unused?: boolean,
};

export const InteractPage: LiveComponent<InteractPageProps> = (props) => {

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
                children:
              
                    use(Aggregate)({
                      children:

                        use(Layout)({
                          children:

                            use(Absolute)({
                              left: '50%',
                              top: 10,
                              right: 10,
                              bottom: 10,

                              children: 

                                use(Block)({
                                  children: [

                                    use(Block)({
                                      width: 300, height: 200, 
                                      children: [

                                        use(Absolute)({
                                          children: [

                                            use(Element)({ }),

                                          ],
                                        }),

                                        use(Absolute)({
                                          left: 10,
                                          top: 10,
                                          right: 10,
                                          bottom: 10,

                                          children: [

                                            use(Element)({
                                              radius: 10,
                                              image: {
                                                texture,
                                                width: 100,
                                                height: 100,
                                                repeat: 'none',
                                              },
                                            }),

                                          ],
                                        }),

                                      ],
                                    }),

                                    use(Block)({
                                      padding: 0,
                                      children: [
                                        use(Element)({ width: 200, height: 100, margin: 10 }),
                                        use(Element)({ height: 100, margin: 10 }),
                                        use(Element)({ width: 200, height: 100, margin: 10 }),
                                      ]
                                    }),

                                    use(Flex)({
                                      align: ['between', 'start'],
                                      children: [
                                        use(Element)({ width: 200, height: 100 }),
                                        use(Element)({ width: 300, height: 100, margin: 30, shrink: 1 }),
                                        use(Block)({
                                          children: [
                                            use(Element)({ width: 200, height: 100 }),
                                            use(Element)({ width: 300, height: 100 }),
                                            use(Element)({ width: 200, height: 100 }),
                                          ]
                                        }),
                                      ]

                                    }),

                                    use(Element)({}),
                                  ]
                                })

                              
                            })

                        })
                    })
                })
            ))
        }),
    })

  );
};
