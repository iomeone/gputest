import type { LC } from '@use-gpu/live';
import type { GLTF } from '@use-gpu/gltf';

import React, { use } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  LinearRGB, Pass, Fetch,
  CompositeData, Data, RawData, Raw, LineSegments,
  OrbitCamera, OrbitControls,
  Cursor, PointLayer, LineLayer,
  Lights, AmbientLight, DirectionalLight, PointLight,
  Loop, Animate,
} from '@use-gpu/workbench';
import { GLTFData, GLTFModel } from '@use-gpu/gltf';

export const GeometryGLTFPage: LC = () => {

  const url = "/gltf/DamagedHelmet/DamagedHelmet.gltf";

  const view = (
    <Loop>
      <LinearRGB>
        <Cursor cursor='move' />
        <Pass>
          <Lights>
            <AmbientLight color={[1, 1, 1]} intensity={0.005} />

            <Animate
              loop
              delay={0}
              keyframes={[
                [0, [30, 20, 10]],
                [4, [20, 10, 40]],
                [8, [10, 20, 20]],
                [12, [30, 20, 10]],
              ]}
              prop='position'
            >
              <PointLight position={[10, 20, 30]} color={[0.5, 0.0, 0.25]} size={40} />
            </Animate>

            <Animate
              loop
              delay={0}
              keyframes={[
                [0, [10, 20, 30]],
                [3, [20, 30, 10]],
                [6, [30, 10, 20]],
                [9, [10, 20, 30]],
              ]}
              prop='position'
            >
              <PointLight position={[10, 20, 30]} color={[1, 0.5, 0.25]} />
            </Animate>
          
            <DirectionalLight position={[-30, -10, 10]} color={[0, 0.5, 1.0]} />
            <GLTFData
              url={url}
              render={(gltf: GLTF) =>
                <GLTFModel gltf={gltf} />
              }
            />
          </Lights>
        </Pass>
      </LinearRGB>
    </Loop>
  );

  return (
    <OrbitControls
      radius={3}
      bearing={0.5}
      pitch={0.3}
      render={(radius: number, phi: number, theta: number) =>
        <OrbitCamera
          radius={radius}
          phi={phi}
          theta={theta}
          scale={1080}
        >
          {view}
        </OrbitCamera>
      }
    />
  );
};
