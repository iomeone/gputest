import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { GPUGeometry, OffscreenRenderContext } from '@use-gpu/core';
import type { Keyframe } from '@use-gpu/workbench';

import React, { Gather, useMemo } from '@use-gpu/live';
import { seq } from '@use-gpu/core';

import {
  Pass,
  CubeCamera, OrbitCamera, OrbitControls,
  Cursor, LinearRGB,
  Animate,
  PrefilteredEnvMap, Environment, DirectionalLight,
  GeometryData, PBRMaterial,
  RenderCubeTarget, RenderToTexture,
  makeSphereGeometry,
  makeBoxGeometry,
} from '@use-gpu/workbench';

import {
  Scene, Node, Mesh, Instances, InstanceProps,
} from '@use-gpu/scene';
import { vec3 } from 'gl-matrix';

import { InfoBox } from '../../ui/info-box';

const τ = Math.PI * 2;

const sphereGeometry = makeSphereGeometry({ width: 2, uvw: true, detail: [32, 64] });
const boxGeometry = makeBoxGeometry({ width: 2, uvw: true });

const randomColors = seq(16).map(() => {
  const r = 0.5 + Math.random() * 0.5;
  const g = 0.25 + Math.random() * 0.5;
  const b = 0.15 + Math.random() * 0.5;
  return [r + g * .2, g + r * .1 - b * .2, b];
});

const randomOffsets = seq(64).map(i => {
  const th = Math.random() * τ;
  const c = Math.cos(th);
  const s = Math.sin(th);
  const r = 5 + Math.random() * 4 + (i > 32 ? 5 : 0);
  const y = Math.random() * 10 - 5;

  return [c * r, y, s * r];
});

const randomRotations = seq(64).map(() => {
  const x = Math.random() * 2 - 1;
  const y = Math.random() * 2 - 1;
  const z = Math.random() * 2 - 1;
  const w = Math.random() * 2 - 1;
  const l = Math.hypot(x, y, z, w);
  return [x/l, y/l, z/l, w/l];
});

const ROTATION_KEYFRAMES = [
  [ 0, [0,   0, 0]],
  [ 6, [0, 360, 0]],
] as Keyframe[];

export const RTTCubeTargetPage: LC = () => {

  return (<>
    <InfoBox>Render to a cube map with &lt;RenderCubeTarget&gt; and use it as an environment map for a &lt;PBRMaterial&gt;</InfoBox>

    <Gather
      children={[
        <GeometryData {...sphereGeometry} />,
        <GeometryData {...boxGeometry} />,
        <RenderCubeTarget width={256} label="Cube Target" />
      ]}
      then={([
        sphereMesh,
        boxMesh,
        renderCubeTarget,
      ]: [
        GPUGeometry,
        GPUGeometry,
        OffscreenRenderContext,
      ]) => (
        <RTTCubeView
          sphereMesh={sphereMesh}
          boxMesh={boxMesh}
          renderCubeTarget={renderCubeTarget}
        />
      )}
    />
  </>);
}

type RTTCubeViewProps = {
  sphereMesh: GPUGeometry,
  boxMesh: GPUGeometry,
  renderCubeTarget: OffscreenRenderContext,
};

const RTTCubeView: LC<RTTCubeViewProps> = (props: RTTCubeViewProps) => {
  const {sphereMesh, boxMesh, renderCubeTarget} = props;

  const getRandomColor = (i: number) => randomColors[i % randomColors.length];
  const getRandomOffset = (i: number) => randomOffsets[i % randomOffsets.length];
  const getRandomRotation = (i: number) => randomRotations[i % randomRotations.length];

  const scene = useMemo(() => (
    <Environment preset='pisa'>
      <DirectionalLight position={[1, 3, 2]} color={[1, 1, 1]} intensity={.25} />

      <Scene>
        <PBRMaterial roughness={0.35}>

          <Animate prop="rotation" keyframes={ROTATION_KEYFRAMES} loop ease="cosine">
            <Node>
              <Instances
                mesh={sphereMesh}
                shaded
              >{
                (Instance: LC<InstanceProps>) => seq(32).map(i =>
                  <Instance
                    key={`${i}`}
                    position={getRandomOffset(i)}
                    color={getRandomColor(i)}
                  />
                )
              }</Instances>
            </Node>
          </Animate>

          <Instances
            mesh={boxMesh}
            shaded
          >{
            (Instance: LC<InstanceProps>) => seq(32).map(i =>
              <Instance
                key={`${i}`}
                position={getRandomOffset(i + 32)}
                quaternion={getRandomRotation(i)}
                color={getRandomColor(i)}
              />
            )
          }</Instances>

        </PBRMaterial>
      </Scene>
    </Environment>
  ), [sphereMesh, boxMesh]);

  return (
    <LinearRGB>
      <Cursor cursor='move' />

        <RenderToTexture target={renderCubeTarget}>
          <CubeCamera position={[0, 0, 0]}>
            <Pass lights>
              {scene}
            </Pass>
          </CubeCamera>
        </RenderToTexture>

        <Camera>
          <Pass lights ssao={1}>
            {scene}
            
            <PrefilteredEnvMap live texture={renderCubeTarget.source}>{
              (cubeMap) =>
                <Environment map={cubeMap}>
                  <PBRMaterial roughness={0.25} metalness={1}>
                    <Node scale={3}>
                      <Mesh mesh={sphereMesh} shaded />
                    </Node>
                  </PBRMaterial>
                </Environment>
            }</PrefilteredEnvMap>

          </Pass>
        </Camera>
    </LinearRGB>
  );
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={20}
    bearing={0.5}
    pitch={0.6}
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
