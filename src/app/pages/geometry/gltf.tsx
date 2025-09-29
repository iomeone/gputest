import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { GLTF } from '@use-gpu/gltf';

import React, { use } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  LinearRGB, Pass, Fetch,
  CompositeData, Data, RawData, Raw, LineSegments,
  OrbitCamera, OrbitControls,
  Cursor, PointLayer, LineLayer,
  AmbientLight, DirectionalLight, PointLight, DomeLight,
  Loop, Animate,
} from '@use-gpu/workbench';

import { GLTFData, GLTFModel } from '@use-gpu/gltf';
import { Scene, Node } from '@use-gpu/scene';

// @ts-ignore
const isDevelopment = process.env.NODE_ENV === 'development';

export const GeometryGLTFPage: LC = () => {

  const base = isDevelopment ? '/' : '/demo/';
  const url = base + "gltf/DamagedHelmet/DamagedHelmet.gltf";

  return (
    <Loop>
      <LinearRGB>
        <Cursor cursor='move' />
        <Camera>
          <Pass lights>
            <AmbientLight color={[1, 1, 1]} intensity={0.005} />

            <Animate
              loop
              delay={0}
              keyframes={[
                [0, [30, 20, 10]],
                [4, [20, 10, 40]],
                [8, [-5, 20, 20]],
                [12, [30, 20, 10]],
              ]}
              prop='position'
            >
              <PointLight position={[10, 20, 30]} color={[0.5, 0.0, 0.25]} intensity={40*40} />
            </Animate>

            <Animate
              loop
              delay={0}
              keyframes={[
                [0, [10, 20, 30]],
                [3, [20, 30, 10]],
                [6, [40, 10, 20]],
                [9, [10, 20, 40]],
              ]}
              prop='position'
            >
              <PointLight position={[10, 20, 30]} color={[1, 0.5, 0.25]} />
            </Animate>
        
            <DirectionalLight position={[-30, -10, 10]} color={[0, 0.5, 1.0]} />
            <DomeLight intensity={0.5} />
          
            <Scene>
              <Node position={[0, -0.1, 0]}>
                <GLTFData
                  url={url}
                  render={(gltf: GLTF) =>
                    <GLTFModel gltf={gltf} />
                  }
                />
              </Node>
            </Scene>
          </Pass>
        </Camera>
      </LinearRGB>
    </Loop>
  );
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={3}
    bearing={0.5}
    pitch={0.3}
    render={(radius: number, phi: number, theta: number, target: vec3) =>
      <OrbitCamera
        radius={radius}
        phi={phi}
        theta={theta}
        target={target}
        scale={1080}
      >
        {children}
      </OrbitCamera>
    }
  />
);
