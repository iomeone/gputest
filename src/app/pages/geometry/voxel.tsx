import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { Vox } from '@use-gpu/voxel';
import type { ShaderSource } from '@use-gpu/shader';
import type { Keyframe } from '@use-gpu/workbench';

import React, { use } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  LinearRGB, Pass, Fetch,
  CompositeData, Data, RawData, Raw, LineSegments,
  OrbitCamera, OrbitControls,
  Cursor, PointLayer, LineLayer,
  AmbientLight, DirectionalLight, PointLight, DomeLight,
  PBRMaterial, GeometryData,
  Loop, Animate, DebugProvider,
  makePlaneGeometry,
} from '@use-gpu/workbench';

import { VoxData, VoxModel } from '@use-gpu/voxel';
import { Scene, Node, Mesh, Primitive } from '@use-gpu/scene';
import { Plot, Cartesian, Grid } from '@use-gpu/plot';

import { VoxControls } from '../../ui/vox-controls';

// @ts-ignore
const isDevelopment = process.env.NODE_ENV === 'development';

const SHADOW_MAP_POINT = {
  size: [1024, 1024],
  depth: [0.1, 100],
  bias: [2, 1/4],
  blur: 2,
};

const R = 20;
const N = 50;
const T = 20;
const τ = Math.PI * 2;

const ANIMATED_LIGHT = Array(N+1).fill(0).map((_, i) => [
  i / N * T, [
    15 - R * Math.cos(i / N * τ),
    23,
    20 + R * Math.sin(i / N * τ),
    1
  ],
]) as Keyframe<any>[];

const STATIC_LIGHTS = [
  [[-15, 12, -28, 1], [1, .5, .5, 1], 40*40*.5],
  [[-20, 15, 10, 1], [.5, .75, 1, 1], 40*40*.25],
] as [number[], number[], number][];

const WHITE = [1, 1, 1, 1];

export const GeometryVoxelPage: LC = () => {

  const base = isDevelopment ? '/' : '/demo/';
  const url = base + "voxel/teardown/propanetank.vox";

  const planeGeometry = makePlaneGeometry({ width: 100, height: 100, axes: 'yx' });

  const renderLight = (position: number[], color: number[], intensity: number) => (<>
    <PointLight position={position} color={color} intensity={intensity} shadowMap={SHADOW_MAP_POINT} />
    <PointLayer count={1} size={20} position={position} color={color} />
  </>);

  const view = (iterations: boolean) => (
    <DebugProvider
      debug={{
        voxel: { iterations },
      }}
    >
      <Loop>
        <LinearRGB tonemap="aces" gain={2} samples={1}>
          <Cursor cursor='move' />
          <Camera>
            <Pass lights shadows>
              <AmbientLight color={[1, 1, 1, 1]} intensity={0.01} />

              <Scene>
                <Node rotation={[90, 180, 0]}>
                  <Primitive>
                    <Plot>
                      <Cartesian
                        range={[[-9, 9], [-25, 25], [-10, 10]]}
                        scale={[9, 25, 10]}
                      >
                        <Grid
                          origin={[0, 0, -11]}
                          axes='xy'
                          width={2}
                          first={{ detail: 3, divide: 18, end: true }}
                          second={{ detail: 3, divide: 48, end: true }}
                          depth={0.5}
                          zBias={1}
                          color={0x404040}
                        />
                        <Grid
                          origin={[0, 0, 0]}
                          axes='xy'
                          width={2}
                          first={{ detail: 3, divide: 18, end: true }}
                          second={{ detail: 3, divide: 48, end: true }}
                          depth={0.5}
                          zBias={1}
                          color={0x404040}
                        />
                      </Cartesian>
                    </Plot>
                  </Primitive>

                  <VoxData
                    url={url}
                    render={(vox: Vox) =>
                      <VoxModel vox={vox} flat />
                    }
                  />

                  <Node position={[0, 0, -11]} rotation={[0, 180, 0]}>
                    <GeometryData
                      geometry={planeGeometry}
                      render={(planeMesh: Record<string, ShaderSource>) =>
                        <PBRMaterial albedo={0x808080} roughness={0.7}>
                          <Mesh
                            mesh={planeMesh}
                            side="both"
                            shaded
                          />
                        </PBRMaterial>
                      }
                    />
                  </Node>
                </Node>
              </Scene>

              <Animate ease="linear" keyframes={ANIMATED_LIGHT} prop="position" render={(position) => renderLight(position, WHITE, 40*40)} />
              {STATIC_LIGHTS.map(([position, color, intensity]) => renderLight(position, color, intensity))}

            </Pass>
          </Camera>
        </LinearRGB>
      </Loop>
    </DebugProvider>
  );

  const root = document.querySelector('#use-gpu .canvas');

  return (
    <VoxControls
      container={root}
      hasShowIterations
      render={({showIterations}) =>
        view(showIterations)
      }
    />
  );
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={60}
    bearing={2.2}
    pitch={0.5}
    render={(radius: number, phi: number, theta: number, target: vec3) =>
      <OrbitCamera
        radius={radius}
        phi={phi}
        theta={theta}
        target={target}
        scale={1080}
        near={0.1}
      >
        {children}
      </OrbitCamera>
    }
  />
);
