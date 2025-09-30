import type { LC, PropsWithChildren } from '../../../live';
import type { LambdaSource, TextureSource } from '../../../core';

import React, { Gather, useState } from '../../../live';
import { vec3 } from 'gl-matrix';

import {
  Pass, InterleavedData, PBRMaterial, RawTexture,
  OrbitCamera,
  FaceLayer,
  PointLight,
} from '../../../workbench';
import {
  Cursor, OrbitControls, Pick, PickState,
} from '../../../interact';
import { InfoBox } from '../../ui/info-box';

import { meshVertexArray, meshSchema, makeTexture } from '../../meshes/cube';

const COLOR_ON = [1, 1, 1, 1];
const COLOR_OFF = [0.5, 0.5, 0.5, 1.0];

// This is a reimplementation of app/components/mesh using standard use.gpu components
export const MeshInterleavedPage: LC = () => {
  const dataTexture = makeTexture();

  const [pressed, setPressed] = useState(false);

  return (<>
    <InfoBox>Render a clickable cube mesh using &lt;InterleavedData&gt; and &lt;FaceLayer&gt;, wrapped in &lt;Pick&gt;.</InfoBox>
    <Gather
      children={[
        <InterleavedData
          schema={meshSchema}
          data={meshVertexArray}
        />,
        <RawTexture
          data={dataTexture}
        />
      ]}
      then={([
        {positions, normals, colors, uvs},
        texture,
      ]: [
        Record<string, LambdaSource>,
        TextureSource,
      ]) => (
        <>
          <Cursor cursor='move' />
          <Camera>
            <Pass picking lights>
              <PointLight position={[-2.5, 3, 2, 1]} intensity={32} />

              <Pick onPointerDown={() => setPressed(s => !s)}>{
                ({id, hovered}: PickState) =>
                  <PBRMaterial albedoMap={texture} albedo={pressed ? COLOR_ON : COLOR_OFF}>
                    <FaceLayer
                      id={id}
                      positions={positions}
                      normals={normals}
                      colors={colors}
                      uvs={uvs}
                      shaded
                    />
                    {hovered ? <Cursor cursor='pointer' /> : null}
                  </PBRMaterial>
              }</Pick>
            </Pass>
          </Camera>
        </>
      )}
    />
  </>);
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={5}
    bearing={0.5}
    pitch={0.3}
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
