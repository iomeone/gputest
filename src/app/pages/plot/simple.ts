import { LiveComponent } from '@use-gpu/live/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';
import { DataField, Emitter, StorageSource, ViewUniforms, UniformAttribute, RenderPassMode } from '@use-gpu/core/types';

import { use, useMemo, useOne, useResource, useState } from '@use-gpu/live';

import {
  Loop, Draw, Pass, Flat,
  CompositeData, ArrayData, Data, RawData, Raw,
  OrbitCamera, OrbitControls,
  Pick, Cursor, PointLayer,
  Animation,
  Plot, Cartesian, Axis, Grid, Scale, Tick, Label, Sampled,
  RenderToTexture,
  Router, Routes,
} from '@use-gpu/components';
import { Mesh } from '../mesh';
import { makeMesh, makeTexture } from '../meshes/mesh';

export type SimplePlotPageProps = {
  canvas: HTMLCanvasElement,
};

let t = 0;

export const SimplePlotPage: LiveComponent<SimplePlotPageProps> = (props) => {
  const {canvas} = props;
  
  const view = (
    use(Loop, {
      children: [
        use(Draw, {
          children: [

            use(Raw, () => {
              t = t + 1/60;
            }),
            use(Cursor, { cursor: 'move' }),
            use(Pass, {
              children: [
          
                use(Plot, {
                  children: [
                  
                    use(Animation, {
                      loop: true,
                      mirror: true,
                      delay: 0,
                      frames: [
                        [0, [[-3, 0], [0, 1], [0, 3]]],
                        [10, [[0, 3], [0, 1], [0, 3]]],
                      ],
                      prop: 'range',
                      children:
                        use(Cartesian, {
                          scale: [2, 1, 1],
                          children: [

                            use(Grid, {
                              axes: 'xy',
                              width: 3,
                              first: { detail: 3, divide: 5 },
                              second: { detail: 3, divide: 5 },
                              depth: 0.5,
                            }),
                            use(Grid, {
                              axes: 'xz',
                              width: 3,
                              first: { detail: 3, divide: 5 },
                              second: { detail: 3, divide: 5 },
                              depth: 0.5,
                            }),
                            use(Axis, {
                              axis: 'x',
                              width: 5,
                              color: [0.75, 0.75, 0.75, 1],
                              depth: 0.5,
                            }),
                            use(Scale, {
                              divide: 5,
                              axis: 'x',
                              children: [
                                use(Tick, {
                                  size: 50,
                                  width: 5,
                                  offset: [0, 1, 0],
                                  color: [0.75, 0.75, 0.75, 1],
                                  depth: 0.5,
                                }),
                                use(Label, {
                                  placement: 'bottom',
                                  color: '#808080',
                                  size: 32,
                                  offset: 16,
                                  expand: 5,
                                  depth: 0.5,
                                }),
                                use(Label, {
                                  placement: 'bottom',
                                  color: '#ffffff',
                                  size: 32,
                                  offset: 16,
                                  expand: 0,
                                  depth: 0.5,
                                }),
                              ],
                            }),
                            use(Axis, {
                              axis: 'y',
                              width: 5,
                              color: [0.75, 0.75, 0.75, 1],
                              detail: 8,
                              depth: 0.5,
                            }),
                            use(Axis, {
                              axis: 'z',
                              width: 5,
                              color: [0.75, 0.75, 0.75, 1],
                              depth: 0.5,
                            }),
                            
                            use(Sampled, {
                              axes: 'xz',
                              format: 'vec4<f32>',
                              size: [64, 32],
                              expr: (emit, x, y) => {
                                const v = Math.cos(x) * Math.cos(y);
                                emit(x, v * .5 + .5, y, 1);
                              },
                              render: (data: ShaderSource) =>
                                use(PointLayer, { positions: data, size: 10, color: [0.2, 0.5, 1, 1], depth: 0.5 }),
                            }),
                          ]
                        })                     
                    })

                  ]
                })

              ]
            }),
          ],

        }),
      ]
    })
  );  

  return (
    use(OrbitControls, {
      canvas,
      radius: 5,
      bearing: 0.5,
      pitch: 0.3,
      render: (radius: number, phi: number, theta: number) =>

        use(OrbitCamera, {
          radius, phi, theta,
          //scale: 540,
          children: view,
        })  
    })
  );
};
