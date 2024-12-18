import type { LC, PropsWithChildren } from '@use-gpu/live';
import React, { Gather, useMemo } from '@use-gpu/live';

import { seq } from '@use-gpu/core';

import {
  Pass,
  OrbitCamera, OrbitControls,
  Pick, Cursor, LinearRGB,
  Environment, DirectionalLight,
  GeometryData, PBRMaterial,
  RenderCubeTarget, RenderToTexture,
  makeSphereGeometry,
  makeBoxGeometry,
} from '@use-gpu/workbench';

import {
  Scene, Node, Instances,
} from '@use-gpu/scene';

import { InfoBox } from '../../ui/info-box';

const τ = Math.PI * 2;

const sphereGeometry = makeSphereGeometry({ width: 2, uvw: true, detail: [32, 64] });
const boxGeometry = makeBoxGeometry({ width: 2 });

const randomColors = seq(16).map(i => {
  const r = 0.5 + Math.random() * 0.5;
  const g = 0.25 + Math.random() * 0.5;
  const b = 0.15 + Math.random() * 0.5;
  return [r + g * .2, g + r * .1 - b * .2, b];
});

const randomOffsets = seq(64).map(i => {
  const th = Math.random() * τ;
  const c = Math.cos(th);
  const s = Math.sin(th);
  const r = 5 + Math.random() * 5;
  const y = Math.random() * 5;

  return [c * r, y, s * r];
});

const randomRotations = seq(64).map(i => {
  const x = Math.random() * 2 - 1;
  const y = Math.random() * 2 - 1;
  const z = Math.random() * 2 - 1;
  const w = Math.random() * 2 - 1;
  const l = Math.hypot(x, y, z, w);
  return [x/l, y/l, z/l, w/l];
});

export const RTTCubeTargetPage: LC = () => {

  return (<>
    <InfoBox>Render to a &lt;RenderCubeTarget&gt;</InfoBox>

    <Gather
      children={[
        <GeometryData {...sphereGeometry} />,
        <GeometryData {...boxGeometry} />,
        <RenderCubeTarget />
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

const RTTCubeView: LC = (props: RTTCubeViewProps) => {
  const {sphereMesh, boxMesh, renderCubeTarget} = props;

  const getRandomColor = (i: number) => randomColors[i % randomColors.length];
  const getRandomOffset = (i: number) => randomOffsets[i % randomOffsets.length];
  const getRandomRotation = (i: number) => randomRotations[i % randomRotations.length];

  const scene = useMemo(() => (
    <Environment preset='pisa'>
      <DirectionalLight position={[1, 3, 2]} color={[1, 1, 1]} intensity={.25} />

      <Scene>
        <PBRMaterial roughness={0.35}>

          <Instances
            mesh={sphereMesh}
            shaded
          >{
            (Instance) => seq(32).map(i =>
              <Instance
                key={`${i}`}
                position={getRandomOffset(i)}
                color={getRandomColor(i)}
              />
            )
          }</Instances>

          <Instances
            mesh={boxMesh}
            shaded
          >{
            (Instance) => seq(32).map(i =>
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
      <Camera>

        <RenderToTexture target={renderCubeTarget}>
          <Pass lights>
            {scene}
          </Pass>
        </RenderToTexture>

        <Pass lights>
          {scene}
        </Pass>
      </Camera>
    </LinearRGB>
  );
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={15}
    bearing={0.5}
    pitch={0.3}
    render={(radius: number, phi: number, theta: number) =>
      <OrbitCamera
        radius={radius}
        phi={phi}
        theta={theta}
      >
        {children}
      </OrbitCamera>
    }
  />
);
