import type { LC, PropsWithChildren } from '../../../live';
import type { GPUGeometry, TextureSource } from '../../../core';

import React, { Gather, useCallback, useMemo } from '../../../live';
import { vec3 } from 'gl-matrix';
import { seq } from '../../../core';

import {
  Loop, Pass, LinearRGB,
  GeometryData, PBRMaterial, ImageTexture, AmbientLight,
  OrbitCamera, Environment,
  EaseToTarget,
  DebugProvider, PrintLayer, PrintHelper, useKeyboardState,
  makeBoxGeometry, makePlaneGeometry, makeSphereGeometry,
} from '../../../workbench';
import {
  Cursor, OrbitControls,
} from '../../../interact';
import {
  Scene, Node, Mesh, Instances,
} from '../../../scene';

import { InfoBox } from '../../ui/info-box';
import { SSAOControls } from '../../ui/ssao-controls';

const sampler = {
  addressModeU: 'repeat',
  addressModeV: 'repeat',
} as GPUSamplerDescriptor;

const boxGeometry = makeBoxGeometry({ width: 2 });
const planeGeometry = makePlaneGeometry({ width: 100, height: 100, axes: 'xz' });
const sphereGeometry = makeSphereGeometry({ width: 2, tile: [6, 3] });

const RESOURCES = [
  <GeometryData {...boxGeometry} />,
  <GeometryData {...planeGeometry} />,
  <GeometryData {...sphereGeometry} />,
  <ImageTexture url="/textures/test.png" sampler={sampler} />,
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

// 5% extra render margin so SSAO does not disappear at edges
const overscan = 0.05;

export const SceneSSAOPage: LC = () => {

  const keyboard = useKeyboardState();

  const view = useCallback((applyAO: boolean, showAO: boolean, renderLive: boolean) => (
    <Gather
      children={RESOURCES}
      then={([
        boxMesh,
        planeMesh,
        sphereMesh,
        texture,
      ]: [
        GPUGeometry,
        GPUGeometry,
        GPUGeometry,
        TextureSource,
      ]) => (
        <DebugProvider debug={{
          ssao: { picking: true, overscan: !showAO },
        }}>
          <LinearRGB tonemap="aces">
            <Cursor cursor='move' />
            <Camera>

              {/* Ensure at least 64 frames for SSAO noise to converge */}
              <Loop live={renderLive} converge={64}>

                <PrintHelper count={4096}>
                  <Pass
                    lights
                    ssao={applyAO ? ssaoOptions : undefined}
                    overscan={overscan}
                    debug={showAO ? 'ssao' : undefined}
                    debugIndex={4}
                  >

                    <AmbientLight intensity={0.05} />
                    <Environment preset="pisa" gain={4}>
                      <Scene>

                        <Node position={[0, -2.001, 0]}>
                          <PBRMaterial albedo={'#505050'} roughness={0.7}>
                            <Mesh
                              mesh={planeMesh}
                              side="both"
                              shaded
                            />
                          </PBRMaterial>
                        </Node>

                        <PBRMaterial albedoMap={texture} roughness={0.5}>
                          <Instances mesh={boxMesh} shaded>
                            {(Instance) => cubes.map((cube) => <Instance {...cube} />)}
                          </Instances>
                          <Instances mesh={sphereMesh} shaded>
                            {(Instance) => spheres.map((sphere) => <Instance {...sphere} />)}
                          </Instances>
                        </PBRMaterial>

                      </Scene>
                    </Environment>
                  </Pass>

                  {/* Put print layer in its own pass so it can render on top of the debug pass */}
                  <Pass
                    overlay
                    merge={!showAO} // Preserve depth buffer.. can't preserve when AO debug is on because depth buffer is mismatched

                    // Match SSAO overscan
                    overscan={{
                      range: 0.05,
                      all: showAO,
                    }}
                  >
                    <PrintLayer size={6} width={3} />
                  </Pass>

                </PrintHelper>

              </Loop>
            </Camera>
          </LinearRGB>
        </DebugProvider>
      )}
    />
  ), []);

  const root = document.querySelector('#use-gpu .canvas');

  return (<>
    <InfoBox>Screen-space ambient occlusion with built-in &lt;SSAOPass&gt;, with bent normals, reprojection and overscan at the edges.</InfoBox>
    <SSAOControls
      container={root}
      render={({applyAO, showAO}) =>
        // React doesn't like a useMemo in a render prop, but it's fine in Live
        // eslint-disable-next-line react-hooks/exhaustive-deps
        useMemo(() => view(applyAO, showAO, keyboard.alt), [applyAO, showAO, keyboard.alt])
      }
    />
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
