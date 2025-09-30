import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { Emit } from '@use-gpu/core';
import type { Keyframe } from '@use-gpu/workbench';

import React, { use, memo } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  Loop, Pass,
  OrbitCamera, OrbitControls,
  Cursor,
  Animate,
  LinearRGB,
} from '@use-gpu/workbench';
import {
  Plot, Spherical, Stereographic4D, Transform4D, Tensor, Line,
} from '@use-gpu/plot';

import { HypersphereControls, HypersphereOptions } from '../../ui/hypersphere-controls';
import { InfoBox } from '../../ui/info-box';

import { quat } from 'gl-matrix';

const π = Math.PI;
const τ = π*2;
const EPS = 1e-3;

const LINE_WIDTH = 3;

const N = 256;
const M = 16;

const RED = [207, 52, 10];
const GREEN = [52, 207, 10];
const BLUE = [30, 150, 255];
const COLORS = [RED, GREEN, BLUE];

const geodesicQuaternionSampler = (axis: number, w: number, h: number, full?: boolean) => {
  const a = quat.create();
  const b = quat.create();

  return (emit: Emit, i: number, j: number) => {
    // Avoid singularity for initial rotation
    const phi = (i / w * τ - π + EPS) * (full ? 1 : 0.5);
    const theta = (j / h * τ - π + EPS) * .5;

    // Rotate around two perpendicular axes XY/YZ/ZX
    const cp = Math.cos(phi);
    const sp = Math.sin(phi);

    const ct = Math.cos(theta);
    const st = Math.sin(theta);

    a[0] = a[1] = a[2] = 0;
    a[3] = 1;

    a[axis] = sp;
    a[3] = cp;

    b[(axis + 1) % 3] = st;
    b[3] = ct; 

    quat.mul(a, a, b);

    // Color by main axis, shade by W coordinate
    const c = COLORS[axis];
    const value = a[3] * .5 + .5;
    const s = 1.2 * (value * .5 + .5) / 255;

    // Position
    emit(a[0], a[1], a[2], a[3]);
    // Color
    emit(c[0] * s, c[1] * s, c[2] * s, 1.0);
  };
};

const angleToQuat = (angle: number) => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [s * 0.433, s * 0.866, s * 0.25, c];
};

export const PlotQuaternionHyperspherePage: LC = () => {

  const frames = [
    [0, 0],
    [120, τ],
  ] as Keyframe[];

  const view = (options: HypersphereOptions) => (<>
    <InfoBox>Visualizing a 4D hypersphere under stereographic projection, as 3 mutually perpendicular toruses.</InfoBox>
    <LinearRGB>
      <Camera>
        <Pass>
          <Plot>
            <Stereographic4D
              bend={options.bend}
              range={[[-1, 1], [-1, 1], [-1, 1], [-1, 1]]}
              scale={[1, 1, 1, 1]}
            >
              {options.animate ? (
                <Animate
                  loop
                  delay={0}
                  ease="linear"
                  keyframes={frames}
                  prop="angle"
                >{(angle: number) => (
                  <Transform4D leftQuaternion={angleToQuat(angle + options.spin)}>
                    <Hypersphere showX={options.showX} showY={options.showY} showZ={options.showZ} full={options.full} />
                  </Transform4D>                
                )}</Animate>
              ) : (
                <Transform4D leftQuaternion={angleToQuat(options.spin)}>
                  <Hypersphere showX={options.showX} showY={options.showY} showZ={options.showZ} full={options.full} />
                </Transform4D>                
              )}
            </Stereographic4D>
          </Plot>
        </Pass>
      </Camera>
    </LinearRGB>
  </>);

  const root = document.querySelector('#use-gpu .canvas');

  return (
    <HypersphereControls
      container={root}
      render={view}
    />
  );
};

const Hypersphere = memo((options: Partial<HypersphereOptions>) => (
  <>
    { options.showX ? (
      <Tensor
        format='vec4<f32>'
        size={[N+1, M+1]}
        items={2}
        as={['positions', 'colors']}
        expr={geodesicQuaternionSampler(0, N, M, options.full)}
      >
        <Line width={LINE_WIDTH} depth={.65} />
      </Tensor>
    ) : null }

    { options.showY ? (
      <Tensor
        format='vec4<f32>'
        size={[N+1, M+1]}
        items={2}
        as={['positions', 'colors']}
        expr={geodesicQuaternionSampler(1, N, M, options.full)}
      >
        <Line width={LINE_WIDTH} depth={.65} />
      </Tensor>
    ) : null }

    { options.showZ ? (
      <Tensor
        format='vec4<f32>'
        size={[N+1, M+1]}
        items={2}
        as={['positions', 'colors']}
        expr={geodesicQuaternionSampler(2, N, M, options.full)}
      >
        <Line width={LINE_WIDTH} depth={.65} />
      </Tensor>
    ) : null }
  </>
), 'Hypersphere');

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={3.5}
    bearing={1.25}
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
