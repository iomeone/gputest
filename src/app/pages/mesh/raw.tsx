import type { LC, PropsWithChildren } from '@use-gpu/live';

import React from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  Pass,
  OrbitCamera, OrbitControls,
  Pick, PickState, Cursor,
} from '@use-gpu/workbench';

import { InfoBox } from '../../ui/info-box';

import { RawMesh } from './components/raw-mesh';
import { makeMesh, makeTexture } from '../../meshes/cube';

export const MeshRawPage: LC = (props) => {
  const mesh = makeMesh();
  const texture = makeTexture();

  return (<>
    <InfoBox>Render a clickable cube mesh using a fully hand-rolled draw call and shaders (if you really want to).</InfoBox>
    <Cursor cursor='move' />
    <Camera>
      <Pass picking>
        <Pick>{
          ({id, hovered, presses}: PickState) => [
            // <RawMesh> is a fully hand-coded component, intended as an anti-example
            // of how to integrate fully custom rendering code with classic GL-style vertex attributes.
            <RawMesh texture={texture} mesh={mesh} blink={presses.left} />,

            // For mouse picking, we render a copy to the picking buffer with the given ID
            <RawMesh id={id} texture={texture} mesh={mesh} mode='picking' />,

            hovered ? <Cursor cursor='pointer' /> : null,
          ]
        }</Pick>
      </Pass>
    </Camera>
  </>);
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={5}
    bearing={0.5}
    pitch={0.3}
  >{
    (radius: number, phi: number, theta: number, target: vec3) =>
      <OrbitCamera
        radius={radius}
        phi={phi}
        theta={theta}
        target={target}
      >
        {children}
      </OrbitCamera>
  }</OrbitControls>
);
