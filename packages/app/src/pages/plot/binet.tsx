import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { Emit } from '@use-gpu/core';

import React, { memo } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  Pass,
  OrbitCamera,
  LinearRGB, PBRMaterial,
  AmbientLight, DirectionalLight, PointLight,
} from '@use-gpu/workbench';
import {
  Cursor, OrbitControls,
} from '@use-gpu/interact';
import {
  Plot, Cartesian, Transform4D, Tensor, Line, Surface, Axis, Label, Scissor,
} from '@use-gpu/plot';

import { BinetControls, BinetOptions } from '../../ui/binet-controls';
import { InfoBox } from '../../ui/info-box';

import { vec2 } from 'gl-matrix';

const π = Math.PI;
const τ = π*2;

const N = 1024;
const M = 256;

const LINE_WIDTH = 5;

const binetSampler = (w: number, h: number, n: number, m: number) => {
  const v = vec2.create();

  /*
  const addc = (t: vec2, a: vec2, b: vec2) => {
    const [ar, ai] = a;
    const [br, bi] = b;
    t[0] = ar + br;
    t[1] = ai + bi;
  };
  */

  const subc = (t: vec2, a: vec2, b: vec2) => {
    const [ar, ai] = a;
    const [br, bi] = b;
    t[0] = ar - br;
    t[1] = ai - bi;
  };

  const mulc = (t: vec2, a: vec2, b: vec2) => {
    const [ar, ai] = a;
    const [br, bi] = b;
    t[0] = ar * br - ai * bi;
    t[1] = ar * bi + ai * br;
  };

  const expc = (t: vec2, v: vec2) => {
    const r = Math.exp(v[0]);
    const th = v[1];

    t[0] = Math.cos(th) * r;
    t[1] = Math.sin(th) * r;
  };

  const logc = (t: vec2, v: vec2) => {
    const ar = Math.hypot(v[0], v[1]);
    const at = Math.atan2(v[1], v[0]);
    t[0] = Math.log(ar);
    t[1] = at;
  };

  const powc = (t: vec2, a: vec2, b: vec2) => {
    logc(v, a);
    mulc(v, v, b);
    expc(t, v);
  };

  const z = vec2.create();
  const t1 = vec2.create();
  const t2 = vec2.create();

  const phi = vec2.fromValues((1 + Math.sqrt(5)) / 2, 0);
  const iphi = vec2.fromValues((1 - Math.sqrt(5)) / 2, 0);
  const is5 = vec2.fromValues(1 / Math.sqrt(5), 0);

  return (emit: Emit, i: number, j: number) => {
    z[0] = (i / n * 2 - 1) * w;
    z[1] = (j / m * 2 - 1) * h + 1;

    powc(t1, phi, z);
    powc(t2, iphi, z);
    subc(t1, t1, t2);
    mulc(t1, t1, is5);
    logc(t2, t1);

    emit(z[0], z[1], t1[1], t1[0]);
    emit(Math.sin(t2[1]) * .25 + .75, Math.sin(t2[1] + τ/3) * .25 + .75, Math.sin(t2[1] + 2*τ/3) * .25 + .75, 1);
  };
};

// Light setup
const lightData = [
  {
    position: [-10, 20, 15, 1],
    color: [1, 1, 1, 1],
  },
  {
    position: [-15, -20, -5, 1],
    color: [0.8, 0.4, 0.8, 1],
  },
  {
    position: [2, 4.5, 2.5, 1],
    color: [0.3, 0.8, 1.0, 1],
  },
];

const angleToMat4 = (angle1: number, angle2: number) => {
  const c1 = Math.cos(angle1);
  const s1 = Math.sin(angle1);

  const c2 = Math.cos(angle2);
  const s2 = Math.sin(angle2);

  return [
    1,  0,  0, 0,
    0, c2, s2, 0,
    0,-s2, c2, 0,
    s1, 0, c1, 1,
  ];
};

const GREY = [0.7, 0.7, 0.7, 1];

export const PlotBinetPage: LC = () => {

  const view = (options: BinetOptions) => (<>
    <InfoBox>Visualizing the complex Binet formula in 4D under 3D cartesian projection.</InfoBox>
    <LinearRGB>
      <Cursor cursor="move" />
      <Camera>
        <Pass lights ssao={1}>

          <AmbientLight intensity={0.3} />
          <DirectionalLight position={lightData[0].position} intensity={0.6} color={lightData[0].color} />
          <DirectionalLight position={lightData[1].position} intensity={0.6} color={lightData[1].color} />
          <PointLight       position={lightData[2].position} intensity={50}  color={lightData[2].color} />

          <PBRMaterial>
            <Plot>
              <Cartesian
                range={[[-5, 5], [-5, 5], [-5, 5], [-5, 5]]}
                scale={[5, 5, 5, 5]}
              >
                <Transform4D matrix={angleToMat4(options.spin1, options.spin2)}>
                  <Axis axis="x" color={GREY} width={3} origin={[0, 0, 0, 0]} end />
                  <Axis axis="y" color={GREY} width={3} origin={[0, 0, 0, 0]} end />
                  <Axis axis="z" color={GREY} width={3} origin={[0, 0, 0, 0]} end />
                  <Axis axis="w" color={GREY} width={3} origin={[0, 0, 0, 0]} end />

                  <Label color={GREY} size={16} weight="bold" position={[5, 0, 0, 0]} label="X" placement="bottomLeft" offset={20} />
                  <Label color={GREY} size={16} weight="bold" position={[0, 5, 0, 0]} label="Y" placement="bottomLeft" offset={20} />
                  <Label color={GREY} size={16} weight="bold" position={[0, 0, 5, 0]} label="Z" placement="bottomLeft" offset={20} />
                  <Label color={GREY} size={16} weight="bold" position={[0, 0, 0, 5]} label="W" placement="bottomLeft" offset={20} />

                  <Scissor range={[[-5 + options.posX, 5 + options.posX], [-1 + options.posY, 3 + options.posY], [-1e8, 1e8], [-1e8, 1e8]]}>
                    <Binet surface={options.surface} />
                  </Scissor>
                </Transform4D>
              </Cartesian>
            </Plot>
          </PBRMaterial>
        </Pass>
      </Camera>
    </LinearRGB>
  </>);

  const root = document.querySelector('#use-gpu .canvas');

  return (
    <BinetControls
      container={root}
      render={view}
    />
  );
};

const Binet = memo((options: Partial<BinetOptions>) => (
    <Tensor
      format='vec4<f32>'
      size={[N+1, M+1]}
      items={2}
      as={['positions', 'colors']}
      expr={binetSampler(5, 2, N, M)}
    >
      <Line width={LINE_WIDTH} depth={0.1} shaded sides={5} />
      {options.surface && <Surface shaded />}
    </Tensor>
), 'Binet');

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={9.5}
    bearing={-0.45}
    pitch={0.3}
  >{
    (radius: number, phi: number, theta: number, target: vec3) =>
      <OrbitCamera
        radius={radius}
        phi={phi}
        theta={theta}
        target={target}
        near={0.1}
        far={1000000}
      >
        {children}
      </OrbitCamera>
  }</OrbitControls>
);
