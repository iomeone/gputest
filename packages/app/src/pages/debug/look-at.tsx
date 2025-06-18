import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { GPUGeometry } from '@use-gpu/core';

import React, { Gather } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  Pass, LinearRGB,
  GeometryData,
  OrbitCamera, OrbitControls, EaseToTarget, LookAt,
  Cursor,
  AxisHelper, Environment, AmbientLight,

  makeBoxGeometry, makePlaneGeometry,
} from '@use-gpu/workbench';

import {
  Scene, Node, Mesh,
} from '@use-gpu/scene';

import { LookAtControls, LookAtOptions } from '../../ui/look-at-controls';

import { InfoBox } from '../../ui/info-box';

const boxGeometry = makeBoxGeometry({ width: 2 });
const planeGeometry = makePlaneGeometry({ width: 100, height: 100, axes: 'xz' });

export const DebugLookAtPage: LC = () => {
  return (<>
    <InfoBox>Easing a target position + camera using &lt;LookAt&gt; combined with &lt;EaseToTarget&gt;.</InfoBox>
    <Gather
      children={[
        <GeometryData {...boxGeometry} />,
        <GeometryData {...planeGeometry} />,
      ]}
      then={([
        boxMesh,
        planeMesh,
      ]: [
        GPUGeometry,
        GPUGeometry,
      ]) => {
        return (
          <LinearRGB tonemap="aces">
            <Cursor cursor='move' />
            <LookAtControls>{
              (lookAt) => (
                <Camera {...lookAt}>
                  <Pass lights>
                    <Environment preset="park">
                      <AmbientLight intensity={0.1} />
                      <AxisHelper size={2} width={3} />

                      <Scene>
                        <Mesh mesh={boxMesh} shaded />
                        <Node position={[0, -1, 0]}>
                          <Mesh mesh={planeMesh} shaded />
                        </Node>
                      </Scene>
                    </Environment>
                  </Pass>
                </Camera>
              )
            }</LookAtControls>
          </LinearRGB>
        );
      }}
    />
  </>);
};

type CameraProps = PropsWithChildren<LookAtOptions>;

const Camera = ({position, target, children}: CameraProps) => {
  // As the camera receives its props from EaseToTarget, reuse the same JSX in the (animated) render prop.
  const view = (
    <OrbitCamera>
      {children}
    </OrbitCamera>
  );
  
  const types = { phi: 'angle', theta: 'angle '};

  return (
    <EaseToTarget values={{position, target}} duration={0.1}>
      <LookAt position={position} target={target}>
        {(orbit) =>
          <OrbitControls {...orbit}>
            {(radius: number, phi: number, theta: number, target: vec3) =>
              <EaseToTarget types={types} values={{radius, phi, theta, target}} duration={0.2}>
                {view}
              </EaseToTarget>
            }
          </OrbitControls>
        }
      </LookAt>
    </EaseToTarget>
  );
};
