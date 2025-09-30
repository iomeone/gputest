import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { CPUGeometry } from '@use-gpu/core';

import React from 'react';
import { Gather, useMemo } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  Pass, LinearRGB,
  OrbitCamera,
  PointLight, DirectionalLight,
  GeometryData, FaceLayer,
  computeMeshNormals,
} from '@use-gpu/workbench';
import {
  Cursor,
  OrbitControls,
} from '@use-gpu/interact';
import { GLTF, GLTFData, GLTFGeometry } from '@use-gpu/gltf';

import { InfoBox } from '../../ui/info-box';

// @ts-ignore
const isDevelopment = process.env.NODE_ENV === 'development';

export const MeshVertexNormalsPage: LC = () => {

  const base = isDevelopment ? '/' : '/demo/';
  const url = base + "gltf/DamagedHelmet/DamagedHelmet.gltf";

  return (<>
    <LinearRGB>
      <InfoBox>Compute vertex normals using mesh helpers.</InfoBox>
      <Cursor cursor='move' />
      <Camera>

        <Gather
          children={[
            <GLTFData url={url} />
          ]}
          then={([gltf]: [GLTF]) => {
            if (!gltf) return null;

            return (
              <Pass lights ssao={1} debug="normal">
                <PointLight position={[10, 20, 30]} color={[0.5, 0.0, 0.25]} intensity={40*40} />
                <PointLight position={[10, 20, 30]} color={[1, 0.5, 0.25]} />
                <DirectionalLight position={[-30, -10, 10]} color={[0, 0.5, 1.0]} />

                <Gather
                  children={<GLTFGeometry gltf={gltf} />}
                  then={([geometry]: [CPUGeometry]) => (
                    <ComputeVertexNormals geometry={geometry} />
                  )}
                />

              </Pass>
            );
          }}
        />
      </Camera>
    </LinearRGB>
  </>);
};

type ComputeVertexNormalsProps = {
  geometry: CPUGeometry,
};

const ComputeVertexNormals = (props: ComputeVertexNormalsProps) => {
  const {geometry} = props;
  if (!geometry) return null;

  const augmented = useMemo(() => {
    return computeMeshNormals(geometry);
  }, [geometry]);

  return (<>
    <GeometryData {...augmented}>
      {(mesh) => (
        <FaceLayer
          shaded
          mesh={mesh}
          side="front"
        />
      )}
    </GeometryData>
  </>);
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={2.5}
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
