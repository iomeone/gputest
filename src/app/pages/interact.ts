import { LiveComponent } from '@use-gpu/live/types';

import { use, gather, resume, useMemo, useOne, useResource, useState } from '@use-gpu/live';

import {
  Draw, Pass,
  Flat, Absolute, Layout, Stack, Flex, Element,
  Aggregate, RawTexture,
} from '@use-gpu/components';
import { Mesh } from '../mesh';
import { makeMesh, makeTexture } from '../meshes/mesh';

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
            ], resume(([source]) =>

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

                                use(Stack)({
                                  children: [
                                    use(Element)({ width: 100, height: 100 }),

                                    use(Stack)({
                                      padding: 0,
                                      children: [
                                        use(Element)({ width: 200, height: 100, margin: 10 }),
                                        use(Element)({ height: 100, margin: 10 }),
                                        use(Element)({ width: 200, height: 100, margin: 10 }),
                                      ]
                                    }),

                                    use(Flex)({
                                      alignX: 'between',
                                      children: [
                                        use(Element)({ width: 200, height: 100 }),
                                        use(Element)({ width: 300, height: 100, margin: 30, shrink: 1 }),
                                        use(Stack)({
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
