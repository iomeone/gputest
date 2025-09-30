import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { GPUGeometry, TextureSource } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import React, { Gather, memo, useContext, useOne } from '@use-gpu/live';
import { seq } from '@use-gpu/core';
import { bindBundle, wgsl } from '@use-gpu/shader/wgsl';
import { vec3 } from 'gl-matrix';

import {
  Loop, Pass, FlatCamera, LinearRGB, Environment,
  GeometryData, PBRMaterial, PrefilteredEnvMap,
  OrbitCamera, OrbitControls, PanControls,
  Cursor, Suspense,
  KeyboardContext,
  makeSphereGeometry,
  useShader, useShaderRef,
} from '@use-gpu/workbench';

import {
  Scene, Node, Mesh,
} from '@use-gpu/scene';
import {
  Cartesian, Grid, Embedded,
} from '@use-gpu/plot';
import {
  UI, Layout, Absolute, Block, Embed,
} from '@use-gpu/layout';

import { InfoBox } from '../../ui/info-box';

import { EnvMapControls } from '../../ui/envmap-controls';

const π = Math.PI;
const τ = π * 2;

const IMAGE_FIT = {fit: 'scale'};

const keyframes = [
  [0, 0],
  [5, 1.0],
  [10, 0],
] as any[];

export const MaterialEnvMapPage: LC = (props) => {
  const geometry = useOne(() => makeSphereGeometry({ width: 2, uvw: true, detail: [32, 64] }));

  const { useKeyboard } = useContext(KeyboardContext);
  const { keyboard } = useKeyboard();
  const {keys} = keyboard;
  const zooming = !!keys.alt;
  const panning = !!keys.shift;

  const root = document.querySelector('#use-gpu .canvas');

  return (<>
    <InfoBox>PBR material spheres of varying roughness and metalness. Octahedral PMREM environment map is generated using compute shaders.</InfoBox>
    <EnvMapControls container={root} hasDebug render={(envPreset, envMap, seamFix, debugGrid) => (
      <Gather
        children={[
          <GeometryData {...geometry} />,
          <Suspense>{envMap}</Suspense>
        ]}
        then={([
          mesh,
          texture,
        ]: [
          GPUGeometry,
          TextureSource,
        ]) => (
          <Camera active={!zooming && !panning}>
            <PrefilteredEnvMap
              texture={texture}
              gain={1}
              seamFix={seamFix}
              debugGrid={debugGrid}
            >{
              (cubeMap: ShaderSource | null, textureMap: TextureSource | null) =>
                <LinearRGB tonemap="aces" gain={3}>
                  <Cursor cursor='move' />
                  <Pass lights>

                    <Environment map={cubeMap} preset={envPreset}>
                      <Scene>
                        {
                          seq(8).flatMap(i =>
                            seq(8).map(j => (
                              <Node key={`${i}-${j}`} position={[i - 3.5, 0, j - 3.5]} scale={[0.35, 0.35, 0.35]}>
                                <PBRMaterial
                                  albedo={[0.6, 0.85, 1.0, 1.0]}
                                  metalness={i / 7}
                                  roughness={j / 7}
                                >
                                  <Mesh mesh={mesh} shaded />
                                </PBRMaterial>
                              </Node>
                            ))
                          )
                        }
                      </Scene>
                    </Environment>

                  </Pass>
                  <PanControls
                    x={-window.innerWidth/2} y={-window.innerHeight/2} zoom={1/2}
                    active={panning || zooming}
                    scroll={zooming}
                  >{
                    (x: number, y: number, zoom: number) =>
                      textureMap ? (
                        <FlatCamera x={x} y={y} zoom={zoom}>
                          <Pass overlay>
                            <UI>
                              <Layout>
                                <Block margin={[0, 0, 0, 0]}>
                                  <Absolute left={0} top={0}>
                                    <Block
                                      width={512}
                                      height={textureMap.size[1] / textureMap.size[0] * 512}
                                      fill={[0, 0, 0, .25]}
                                      texture={textureMap}
                                      image={IMAGE_FIT}
                                    />
                                  </Absolute>
                                </Block>
                              </Layout>
                            </UI>
                          </Pass>
                        </FlatCamera>
                      ) : null
                  }</PanControls>
              </LinearRGB>
            }</PrefilteredEnvMap>
          </Camera>
        )}
      />
    )} />
  </>);
};

type CameraProps = PropsWithChildren<{
  active: boolean,
}>;

const Camera: LC<CameraProps> = ({active, children}: CameraProps) => {
  return (
    <OrbitControls
      active={active}
      radius={6.5}
      bearing={-2.4}
      pitch={0.2}
      render={(radius: number, phi: number, theta: number, target: vec3) =>
        <OrbitCamera
          radius={radius}
          phi={phi}
          theta={theta}
          target={target}
        >
          {children}
        </OrbitCamera>
      }
    />
  );
}
