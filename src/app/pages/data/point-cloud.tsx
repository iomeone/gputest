import type { LC, PropsWithChildren } from '../../../live';

import React from '../../../live';

import {
  Pass, LinearRGB, Loop,
  OrbitCamera, EaseToTarget,
  PointLayer, PBRMaterial,
  AmbientLight, Environment,
} from '../../../workbench';
import { Cursor, OrbitControls } from '../../../interact';
import { Transform } from '../../../plot';
import { vec3 } from 'gl-matrix';

import { InfoBox } from '../../ui/info-box';
import { PointCloudLoader } from './point-cloud/point-cloud-loader';

const isDevelopment = process.env.NODE_ENV === 'development';
const base = isDevelopment ? '/' : '/demo/';

const WHITE = [1, 1, 1, 1];
const YELLOW = [0.8, 0.8, 0.25, 1.0];

export const DataPointCloudPage: LC = () => {

  const url = `${base}points/cmdf-veg/data.json`;

  return (<>
    <InfoBox>Point cloud data rendered as sphere sprites, using a built-in pixel shader and a custom loader.</InfoBox>
    <Cursor cursor="move" />

    <LinearRGB tonemap="aces">
      <Loop converge={32}>
        <Camera>
          <Pass lights ssao={{radius: 20, indirect: 0.25}}>

            <Environment preset="pisa" gain={4}>
              <AmbientLight intensity={0.25} />

              <PointCloudLoader
                url={url}
              >
                {({attributes}) => (
                  <Transform position={[-2000, -100, -2300]}>
                    <PBRMaterial albedo={WHITE}>
                      <PointLayer
                        {...attributes}
                        size={5}
                        depth={-1}
                        color={YELLOW}
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
}

const Camera = ({children}: PropsWithChildren<object>) => {
  const view = <OrbitCamera near={0.1} far={100000}>{children}</OrbitCamera>;

  return (
    <OrbitControls
      radius={400}
      bearing={0.95}
      pitch={0.3}
      maxRadius={5000}
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
