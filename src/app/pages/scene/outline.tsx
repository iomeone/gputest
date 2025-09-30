import type { LC, PropsWithChildren } from '../../../live';
import type { GPUGeometry } from '../../../core';

import React, { Gather } from '../../../live';
import { vec3 } from 'gl-matrix';
import { seq } from '../../../core';

import {
  Loop, Pass, LinearRGB,
  GeometryData, PBRMaterial, AmbientLight,
  OrbitCamera, Environment,
  EaseToTarget,
  makeBoxGeometry, makePlaneGeometry, makeSphereGeometry,
} from '../../../workbench';
import {
  Cursor, OrbitControls,
} from '../../../interact';
import {
  Scene, Node, Mesh, Instances,
} from '../../../scene';

import { InfoBox } from '../../ui/info-box';

const boxGeometry = makeBoxGeometry({ width: 2 });
const planeGeometry = makePlaneGeometry({ width: 100, height: 100, axes: 'xz' });
const sphereGeometry = makeSphereGeometry({ width: 2, tile: [6, 3] });

const RESOURCES = [
  <GeometryData {...boxGeometry} />,
  <GeometryData {...planeGeometry} />,
  <GeometryData {...sphereGeometry} />,
];

const rnd = () => Math.random() * 2.0 - 1.0;

const cubes = seq(30).map(() => {
  const s = Math.random() + .5;
  return {
    position: [rnd() * 12, -2 + s, rnd() * 12],
    rotation: [0, Math.random() * 360, 0],
    scale: [s, s, s],
  };
});

const spheres = seq(30).map(() => {
  const s = Math.random() + .5;
  return {
    position: [rnd() * 12, -2 + s, rnd() * 12],
    rotation: [0, Math.random() * 360, 0],
    scale: [s, s, s],
  };
});

const ssaoOptions = {
  radius: 2,            // World-space radius
  opacity: 1,           // Intensity of AO
  indirect: 0.6,        // Intensity of fake indirect bounce

  temporalBlend: 0.125, // Blend X% new samples in per frame (if reprojected)
  depthRamp: 10,        // Slope of reprojection depth weight (higher = stricter)
  normalRamp: 3,        // Slope of reprojection normal weight (higher = stricter)
};

const outlineOptions = {
  inner: 1,
  outer: 2,
  color: [.1, .1, .1, 1],
};

// 5% extra render margin so SSAO does not disappear at edges
const overscan = 0.05;

export const SceneOutlinePage: LC = () => {

  const view = (
    <Gather
      children={RESOURCES}
      then={([
        boxMesh,
        planeMesh,
        sphereMesh,
      ]: [
        GPUGeometry,
        GPUGeometry,
        GPUGeometry,
      ]) => (
        <LinearRGB tonemap="aces">
          <Cursor cursor='move' />
          <Camera>

            {/* Ensure at least 64 frames for SSAO noise to converge */}
            <Loop converge={64}>

              <Environment preset="pisa" gain={4}>
                <Pass
                  facets
                  lights
                  ssao={ssaoOptions}
                  outline={outlineOptions}
                  overscan={overscan}
                  debugIndex={4}
                >

                  <AmbientLight intensity={0.05} />
                  <Scene>

                    <Node position={[0, -2.001, 0]}>
                      <PBRMaterial albedo={'#505050'} roughness={0.7}>
                        <Mesh
                          facet={30}
                          mesh={planeMesh}
                          side="both"
                          shaded
                          zBias={-100}
                        />
                        <Node scale={[0.5, 1, 0.5]}>
                          <Mesh
                            // Use `facet` to distinguish co-planar faces (for outlines)
                            facet={10}
                            mesh={planeMesh}
                            side="both"
                            shaded
                            zBias={100}
                          />
                        </Node>
                      </PBRMaterial>
                    </Node>

                    <PBRMaterial roughness={0.5}>
                      <Instances mesh={boxMesh} shaded>
                        {(Instance) => cubes.map((cube) => <Instance {...cube} />)}
                      </Instances>
                      <Instances mesh={sphereMesh} shaded>
                        {(Instance) => spheres.map((sphere) => <Instance {...sphere} />)}
                      </Instances>
                    </PBRMaterial>

                  </Scene>
                </Pass>
              </Environment>

            </Loop>
          </Camera>
        </LinearRGB>
      )}
    />
  );

  return (<>
    <InfoBox>Rendering anti-aliased outlines with &lt;OutlinePass&gt;, combined with SSAO.</InfoBox>
    {view}
  </>);
};

const Camera = ({children}: PropsWithChildren<object>) => {
  const view = <OrbitCamera near={0.1} far={1000}>{children}</OrbitCamera>;

  return (
    <OrbitControls
      radius={9}
      bearing={-1.8}
      pitch={0.6}
      render={(radius: number, phi: number, theta: number, target: vec3) => (
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
      )}
    />
  );
};
