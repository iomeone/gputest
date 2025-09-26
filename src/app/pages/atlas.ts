import { LiveComponent } from '../../live/types';

import { use, useMemo, useOne, useResource, useState } from '../../live';

import {
  Draw, Pass,
  Flat, UI, DebugAtlas,
} from '../../components';

export type AtlasPageProps = {
  _unused?: boolean,
};

export const AtlasPage: LiveComponent<AtlasPageProps> = (props) => {

  return (
    use(Draw)({
      children:

        use(Pass)({
          children:

            use(Flat)({
              children:
              
                use(UI)({
                  children:

                    use(DebugAtlas)(),

                })

            })
      
        }),
    })

  );
};
