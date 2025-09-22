import { LiveComponent } from '../live/types';
import { CanvasRenderingContextGPU } from '../webgpu/types';
import { ShaderLanguages, StorageSource, ViewUniforms, UniformAttribute } from '../core/types';

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
import { Data } from './data';
import { makeMesh } from './meshes/mesh';
import { UseInspect } from '../inspect';

export type AppProps = {
  device: GPUDevice,
  adapter: GPUAdapter,
  canvas: HTMLCanvasElement,
  languages: ShaderLanguages,
};

const seq = (n: number, s: number = 0, d: number = 1) => Array.from({ length: n }).map((_, i: number) => s + d * i);

const data = seq(100).map((i) => ({
  position: [Math.random()*4-2, Math.random()*4-2, Math.random()*4-2, 1],
  size: Math.random() * 50 + 10,
}));

const fields = [
  ['vec4', 'position'],
  ['float', 'size'],
];

export const App: LiveComponent<AppProps> = (fiber) => (props) => {
  const {canvas, device, adapter, languages} = props;

  const inspect = useInspector();
  const mesh = makeMesh();

  const view = [
    use(Pass)({
      children: [
        use(Data)({
          data,
          fields,
          render: ([positions, sizes]: StorageSource[]) => use(Quads)({ positions, sizes }),
          //live: true,
        }),
        /*
        use(RawData)({
          type: 'vec4',
          length: 100,
          expr: (emit) => emit(Math.random()*4-2, Math.random()*4-2, Math.random()*4-2, 1),
          render: (positions) => use(Quads)({ positions }),
          //live: true,
        }),
        */
        //use(Mesh)({ mesh }),
        use(Cube)(),
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
  const [inspect, setInspect] = useState<boolean>(true);
  useResource((dispose) => {
    const keydown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'i') setInspect((s) => !s);
    }

    window.addEventListener('keydown', keydown);
    dispose(() => window.addEventListener('keydown', keydown));
  });

  return inspect;
}
