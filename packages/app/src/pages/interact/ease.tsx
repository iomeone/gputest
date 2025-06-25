import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { GPUGeometry } from '@use-gpu/core';

import React, { Gather, useOne } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  Pass, LinearRGB,
  GeometryData,
  OrbitCamera, EaseToTarget,
  AxisHelper, Environment, AmbientLight,

  makeBoxGeometry,
} from '@use-gpu/workbench';
import {
  Cursor, OrbitControls,
} from '@use-gpu/interact';
import {
  Scene, Mesh,
} from '@use-gpu/scene';

import { InfoBox } from '../../ui/info-box';

export const InteractEasePage: LC = () => {
  const geometry = useOne(() => makeBoxGeometry({ width: 2 }));

  return (<>
    <InfoBox>Easing a camera using &lt;EaseToTarget&gt;.</InfoBox>
    <Gather
      children={[
        <GeometryData {...geometry} />,
      ]}
      then={([
        mesh,
      ]: [
        GPUGeometry,
      ]) => {
        return (
          <LinearRGB tonemap="aces">
            <Cursor cursor='move' />
            <Camera>
              <Pass lights>
                <Environment preset="park">
                  <AmbientLight intensity={0.1} />
                  <AxisHelper size={2} width={3} />

                  <Scene>
                    <Mesh mesh={mesh} shaded />
                  </Scene>
                </Environment>
              </Pass>
            </Camera>
          </LinearRGB>
        );
      }}
    />
  </>);
};

const Camera = ({children}: PropsWithChildren<object>) => {
  // As the camera receives its props from EaseToTarget, reuse the same JSX in the (animated) render prop.
  const view = (
    <OrbitCamera>
      {children}
    </OrbitCamera>
  );

  return (
    <OrbitControls
      radius={5}
      bearing={0.5}
      pitch={0.3}
      render={(radius: number, phi: number, theta: number, target: vec3) =>
        <EaseToTarget values={{radius, phi, theta, target}}>
          {view}
        </EaseToTarget>
      }
    />
  );
};
