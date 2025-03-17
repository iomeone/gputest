import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { GPUGeometry, TextureSource } from '@use-gpu/core';

import React, { Gather } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';
import { seq } from '@use-gpu/core';

import {
  Loop, Pass, LinearRGB,
  GeometryData, PBRMaterial, ImageTexture, AmbientLight,
  OrbitCamera, OrbitControls, Environment,
  Cursor,
  DebugProvider, PrintLayer, PrintHelper,
  makeBoxGeometry, makePlaneGeometry, makeSphereGeometry,
} from '@use-gpu/workbench';

import {
  Scene, Node, Mesh, Instances,
} from '@use-gpu/scene';

import { InfoBox } from '../../ui/info-box';
import { SSAOControls } from '../../ui/ssao-controls';

const sampler = {
  addressModeU: 'repeat',
  addressModeV: 'repeat',
} as GPUSamplerDescriptor;

const boxGeometry = makeBoxGeometry({ width: 2 });
const planeGeometry = makePlaneGeometry({ width: 100, height: 100, axes: 'xz' });
const sphereGeometry = makeSphereGeometry({ width: 2, tile: [6, 3] });

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

export const SceneSSAOPage: LC = () => {

  const view = (showAO: boolean) => (
    <DebugProvider
      debug={{
        ssao: { picking: true },
      }}
    >
      <Gather
        children={[
          <GeometryData {...boxGeometry} />,
          <GeometryData {...planeGeometry} />,
          <GeometryData {...sphereGeometry} />,
          <ImageTexture url="/textures/test.png" sampler={sampler} />,
        ]}
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
          <LinearRGB tonemap="aces">
            <Cursor cursor='move' />
            <Camera>

              {/* Ensure at least 64 frames for SSAO noise to converge */}
              <Loop converge={64}>

                <PrintHelper count={4096}>
                  <Pass
                    lights
                    ssao={{
                      radius: 2,      // World-space radius
                      depthRamp: 10,  // Slope of reprojection depth weight (higher = stricter)
                      normalRamp: 3,  // Slope of reprojection normal weight (higher = stricter)
                    }}
                    overscan={0.05}   // 5% extra render margin so SSAO does not disappear at edges
                    
                    debug={showAO ? 'ssao' : undefined}
                    debugIndex={4}
                  >

                    <AmbientLight intensity={0.4} />
                    <Environment preset="pisa" gain={3}>
                      <Scene>

                        <Node position={[0, -2.001, 0]}>
                          <PBRMaterial albedo={'#808080'} roughness={0.7}>
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

                    <PrintLayer size={6} width={3} />

                  </Pass>

                </PrintHelper>

              </Loop>
            </Camera>
          </LinearRGB>
        )}
      />
    </DebugProvider>
  );

  const root = document.querySelector('#use-gpu .canvas');

  return (<>
    <InfoBox>Screen-space ambient occlusion with built-in &lt;SSAOPass&gt;, with bent normals, reprojection and overscan at the edges.</InfoBox>
    <SSAOControls
      container={root}
      render={({showAO}) =>
        view(showAO)
      }
    />
  </>);
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={9}
    bearing={-1.8}
    pitch={0.6}
    render={(radius: number, phi: number, theta: number, target: vec3) => (
      <OrbitCamera
        radius={radius}
        phi={phi}
        theta={theta}
        near={0.1}
        far={1000}
        target={target}
      >
        {children}
      </OrbitCamera>
    )}
  />
);
