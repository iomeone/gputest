import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { Emit, StorageSource, TextureSource, LambdaSource, TensorArray, Time } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import React, { Gather, Provide } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  Loop, Pass, Cursor,
  OrbitCamera, OrbitControls,
  Animate, Keyframe,
  LinearRGB, DirectionalLight,
  DataShader,
  Environment, PBRMaterial, PrefilteredEnvMap,
  useShaderRef,
} from '@use-gpu/workbench';
import {
  Plot, Cartesian, Polar, Axis, Grid, Sampler, ImplicitSurface, Point,
} from '@use-gpu/plot';
import { wgsl } from '@use-gpu/shader/wgsl';
import { SurfaceControls } from '../../ui/surface-controls';

import { InfoBox } from '../../ui/info-box';

const π = Math.PI;
const τ = π * 2;

const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

const f = (x: number, y: number, z: number, t: number) => {
  //return Math.sqrt(x*x + (y-6)*(y-6) + z*z) - 3.5;
  //return Math.max(Math.abs(x)/1.5, Math.abs(y - 6)*2 - Math.cos(t / 3) * .5, Math.abs(z*.59)) - 3.02 - Math.cos(t / 5)*.65;

  const f = Math.cos(t * .5) * .5 + .5;

  const x2 = x * 2;
  const y2 = y * 2;
  const z2 = z * 2;
  const cx = Math.cos(x2);
  const sx = Math.sin(x2);
  const cy = Math.cos(y2);
  const sy = Math.sin(y2);
  const cz = Math.cos(z2);
  const sz = Math.sin(z2);

  const swirl = sx * cy + sy * cz + sz * cx;
  const grid = cx + cy + cz;
  return lerp(swirl, grid, f);
}

const VOLUME_SIZE = [42, 28, 42];

const EXPR_POSITION = (emit: Emit, x: number, y: number, z: number) => emit(x, y, z, 1);

const EXPR_VALUE = (emit: Emit, x: number, y: number, z: number, time: Time) => {
  const t = time.elapsed / 1000;
  emit(f(x, y, z, t));
}

const EXPR_NORMAL = (emit: Emit, x: number, y: number, z: number, time: Time) => {
  const t = time.elapsed / 1000;
  const e = 1e-3;

  const f = Math.cos(t * .5) * .5 + .5;

  /*
  // Numerical gradient is slower but works for any function
  const v  = f(x, y, z, t);
  const vx = f(x + e, y, z, t);
  const vy = f(x, y + e, z, t);
  const vz = f(x, y, z + e, t);

  const nx = vx - v;
  const ny = vy - v;
  const nz = vz - v;
  */

  // d/dx d/dy d/dz
  const x2 = x * 2;
  const y2 = y * 2;
  const z2 = z * 2;
  const cx = Math.cos(x2);
  const sx = Math.sin(x2);
  const cy = Math.cos(y2);
  const sy = Math.sin(y2);
  const cz = Math.cos(z2);
  const sz = Math.sin(z2);

  const swirlX = cx * cy - sz * sx;
  const swirlY = sx * -sy + cy * cz;
  const swirlZ = sy * -sz + cz * cx;
  const gridX = -sx;
  const gridY = -sy;
  const gridZ = -sz;

  const nx = lerp(swirlX, gridX, f);
  const ny = lerp(swirlY, gridY, f);
  const nz = lerp(swirlZ, gridZ, f);

  const nl = 1/Math.sqrt(nx*nx + ny*ny + nz*nz);

  emit(nx*nl, ny*nl, nz*nl);
};

const BACKGROUND = [0, 0, 0.09, 1];

const SHADOW_MAP_DIRECTIONAL = {
  size: [2048, 2048],
  span: [6, 6],
  depth: [0, 7],
  bias: [0, 0, 1/64],
  blur: 4,
};

const prefilteredEnvMap = ([texture]: TextureSource[]) => <PrefilteredEnvMap texture={texture} />;

export const PlotImplicitSurfacePage: LC = () => {

  const colorizeShader = wgsl`
    @link fn getData(i: u32) -> f32 {};

    fn main(i: u32) -> vec4<f32> {
      let sample = getData(i);
      return vec4<f32>(max(0.0, sample), max(0.0, sample * .2) + max(0.0, -sample * .3), max(0.0, -sample), 1.0);
    }
  `;

  const root = document.querySelector('#use-gpu .canvas');
  const keyframes = [[0, 0], [23, 1.0]] as Keyframe[];

  return (<>
    <InfoBox>Plot an implicit function with &lt;ImplicitSurface&gt; in an animated &lt;Polar&gt; viewport. Control lighting and environment.</InfoBox>
    <SurfaceControls
      container={root}
      hasInspect
      render={({inspect, mode, level, env, roughness, metalness, envMap}) => (
          <Gather children={
            <Gather children={envMap} then={prefilteredEnvMap} />
          } then={([envMap]: ShaderSource[]) => (
            <LinearRGB backgroundColor={BACKGROUND} tonemap="aces" gain={2}>
              <Cursor cursor="move" />
              <Camera>
                <Pass lights shadows>
                  <Environment map={envMap} preset={env} gain={0.5}>
                    <DirectionalLight position={[1, 3, 2]} color={[1, 1, 1]} intensity={1} shadowMap={SHADOW_MAP_DIRECTIONAL} />
                    <Plot>
                      <Animate prop='bend' keyframes={keyframes} delay={1} mirror>
                        <Polar
                          bend={0}
                          range={[[-π, π], [1, 5], [-π, π]]}
                          scale={[π/2, 1, π/2]}
                        >
                          <Grid
                            axes='xy'
                            width={2}
                            first={{ unit: π, base: 2, detail: 3, divide: 5, end: true }}
                            second={{ detail: 64, divide: 5, end: true }}
                            depth={0.5}
                            zBias={-1}
                          />
                          <Grid
                            axes='xz'
                            width={2}
                            first={{ unit: π, base: 2, detail: 3, divide: 5, end: true }}
                            second={{ unit: π, base: 2, detail: 64, divide: 5, end: true }}
                            depth={0.5}
                            zBias={-1}
                          />

                          <Axis
                            axis='x'
                            detail={64}
                            width={5}
                            color={[0.75, 0.75, 0.75, 1]}
                            depth={0.5}
                          />
                          <Axis
                            axis='y'
                            width={5}
                            color={[0.75, 0.75, 0.75, 1]}
                            detail={8}
                            depth={0.5}
                          />
                          <Axis
                            axis='z'
                            width={5}
                            color={[0.75, 0.75, 0.75, 1]}
                            detail={8}
                            depth={0.5}
                          />
                          <Gather
                            children={<>
                              <Sampler
                                axes='xyz'
                                format='vec3<f32>'
                                size={VOLUME_SIZE}
                                padding={1}
                                expr={EXPR_POSITION}
                              />
                              <Sampler
                                axes='xyz'
                                format='vec3<f32>'
                                size={VOLUME_SIZE}
                                padding={1}
                                expr={EXPR_NORMAL}
                                time
                                live
                              />
                              <Sampler
                                axes='xyz'
                                format='f32'
                                size={VOLUME_SIZE}
                                padding={1}
                                expr={EXPR_VALUE}
                                time
                                live
                              />
                            </>}
                            then={
                              ([positions, normals, values]: TensorArray[]) => (<>
                                <PBRMaterial roughness={roughness} metalness={metalness}>
                                  <ImplicitSurface
                                    values={values}
                                    normals={normals}
                                    level={level}
                                    method="linear"
                                    padding={1}
                                    shaded
                                    color={[0.8, 0.8, 1.0, 1.0]}
                                  />
                                </PBRMaterial>
                                {inspect ? (
                                  <DataShader
                                    shader={colorizeShader}
                                    data={values}
                                  >{
                                    (colorizedValues: LambdaSource) => (
                                      <Point
                                        positions={positions}
                                        colors={mode === 'normal' ? normals : colorizedValues}
                                        size={3}
                                        depth={1}
                                      />
                                    )
                                  }</DataShader>
                                ) : null}
                              </>)
                            }
                          />
                        </Polar>
                      </Animate>
                    </Plot>
                  </Environment>
                </Pass>
              </Camera>
            </LinearRGB>
          )} />
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
