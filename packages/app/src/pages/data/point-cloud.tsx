import type { LC, PropsWithChildren } from '@use-gpu/live';

import React from '@use-gpu/live';

import {
  Pass, LinearRGB, Loop,
  OrbitControls, OrbitCamera, EaseToTarget,
  Cursor, PointLayer, PBRMaterial,
  DirectionalLight, AmbientLight, Environment,
  GeometryData, makePlaneGeometry,
} from '@use-gpu/workbench';
import { Transform } from '@use-gpu/plot';
import { Mesh } from '@use-gpu/scene';
import { vec3 } from 'gl-matrix';

import { InfoBox } from '../../ui/info-box';
import { PointCloudLoader } from './point-cloud/point-cloud-loader';

const isDevelopment = process.env.NODE_ENV === 'development';
const base = isDevelopment ? '/' : '/demo/';

const π = Math.PI;
const WHITE = [1, 1, 1, 1];

const planeGeometry = makePlaneGeometry({ width: 5500, height: 5500, axes: 'xz' });

const SHADOW_MAP_DIRECTIONAL = {
  size: [2048, 2048],
  span: [7000, 7000],
  depth: [0, 6000],
  bias: [1/2048, 1/256, 1],
  blur: 4,
};

const lightData = [
  {
    position: [-1000, 2000, 1500, 1],
    color: [1, 1, 1, 1],
  },
];

export const DataPointCloudPage: LC = () => {

  const url = `${base}points/cmdf-veg/data.json`;

  const view = (<>
    <InfoBox>Geographical point cloud rendered as shaded sprites, using a built-in pixel shader.</InfoBox>
    <Cursor cursor="move" />

    <LinearRGB tonemap="aces">
      <Loop converge={32}>
        <Camera>
          <Pass lights shadows ssao={{radius: 20}}>

            <Environment preset="park" gain={4}>
              <AmbientLight intensity={0.25} />
              <DirectionalLight position={lightData[0].position} intensity={0.5} color={lightData[0].color} shadowMap={SHADOW_MAP_DIRECTIONAL} />

              <Transform position={[0, -190, 0]}>
                <GeometryData {...planeGeometry}>
                  {mesh =>
                    <PBRMaterial albedo={[0.25, 0.25, 0.25, 1.0]}>
                      <Mesh mesh={mesh} shaded />
                    </PBRMaterial>
                  }
                </GeometryData>
              </Transform>

              <PointCloudLoader
                url={url}
              >
                {(attributes) => (
                  <Transform position={[-2000, -200, -2300]}>
                    <PBRMaterial albedo={[0.25, 0.5, 0.25, 1.0]}>
                      <PointLayer
                        {...attributes}
                        size={5}
                        depth={-1}
                        color={WHITE}
                        shaded
                        shadow
                      />
                    </PBRMaterial>
                  </Transform>
                )}
              </PointCloudLoader>
            </Environment>

          </Pass>
        </Camera>
      </Loop>
    </LinearRGB>
  </>);

  const root = document.querySelector('#use-gpu .canvas');

  return view;
}

const Camera = ({children}: PropsWithChildren<object>) => {
  const view = <OrbitCamera near={0.1} far={100000}>{children}</OrbitCamera>;

  return (
    <OrbitControls
      radius={400}
      bearing={0.5}
      pitch={0.3}
      render={(radius: number, phi: number, theta: number, target: vec3) =>
        <EaseToTarget
          values={{
            radius,
            phi,
            theta,
            target,
          }}
        >
          {view}
        </EaseToTarget>
      }
    />
  );
};
