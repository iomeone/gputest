import { LiveComponent } from '../live/types';
import { CanvasRenderingContextGPU } from '../webgpu/types';
import { ShaderLanguages, ViewUniforms, UniformAttribute } from '../core/types';

import { use, useMemo, useOne, useResource, useState } from '../live';

import {
  AutoCanvas,
  Loop, Draw, Pass,
  OrbitCamera, OrbitControls,
  Picking,
  RenderToTexture,
  ViewProvider,
} from '../components';
import { Cube } from './cube';
import { Mesh } from './mesh';
import { Quads } from './quads';
import { RawData } from './raw-data';
import { makeMesh } from './meshes/mesh';
import { UseInspect } from '../inspect';

export type AppProps = {
  device: GPUDevice,
  adapter: GPUAdapter,
  canvas: HTMLCanvasElement,
  languages: ShaderLanguages,
};

const seq = (n: number, s: number, d: number) => Array.from({ length: n }).map((_, i: number) => s + d * i);

export const App: LiveComponent<AppProps> = (fiber) => (props) => {
  const {canvas, device, adapter, languages} = props;

  const inspect = useInspector();
  const mesh = makeMesh();

  const view = [
    use(Pass)({
      children: [
        use(RawData)({
          type: 'vec4',
          data: seq(8).flatMap(() => [Math.random(), Math.random(), Math.random(), 1]),
          render: (positions) => 
            use(Quads)({ positions }),
        }),
        //use(Mesh)({ mesh }),
        //use(Cube)(),
      ]
    }),
  ];

  return [
    use(AutoCanvas)({
      canvas, device, adapter, languages, samples: 4,
      children:
      
        use(Picking)({
          children:

            use(OrbitControls)({
              canvas,
              render: (radius: number, phi: number, theta: number) =>

                use(OrbitCamera)({
                  canvas, radius, phi, theta,
                  render: (defs: UniformAttribute[], uniforms: ViewUniforms) =>

                    use(ViewProvider)({
                      defs, uniforms, children:

//                        use(Loop)({
//                          children: [

                            //use(RenderToTexture)({
                            //  children: view,
                            //}),
                  
                            use(Draw)({
                              children: view,
                            }),

//                          ],
//                        })
                  
                    })
                })
            })
        })
    }),
    inspect ? use(UseInspect)({fiber, canvas}) : null,
  ];
};

const useInspector = () => {
  const [inspect, setInspect] = useState<boolean>(false);
  useResource((dispose) => {
    const keydown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'i') setInspect((s) => !s);
    }

    window.addEventListener('keydown', keydown);
    dispose(() => window.addEventListener('keydown', keydown));
  });

  return inspect;
}
