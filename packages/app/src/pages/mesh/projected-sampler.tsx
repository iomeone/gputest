import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { CPUGeometry, VectorLike } from '@use-gpu/core';

import React from 'react';
import { Gather, useMemo, useState } from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  Cursor, Pass, LinearRGB,
  OrbitCamera, OrbitControls,
  PointLight, DirectionalLight, Environment,
  GeometryData, FaceLayer,
  useViewContext,
} from '@use-gpu/workbench';

import { GLTF, GLTFData, GLTFGeometry, GLTFModel } from '@use-gpu/gltf';
import { Plot, Point } from '@use-gpu/plot';

import { HTML } from '@use-gpu/react';
import { InfoBox } from '../../ui/info-box';

import { cullMesh, sampleMesh } from './projected-sampler/mesh-sampler';

// @ts-ignore
const isDevelopment = process.env.NODE_ENV === 'development';

const POPUP_STYLE = {position: 'absolute', left: 0, bottom: 0, background: '#000', padding: '10px'};

export const MeshProjectedSamplerPage: LC = () => {

  const base = isDevelopment ? '/' : '/demo/';
  const url = base + "gltf/DamagedHelmet/DamagedHelmet.gltf";

  const [point, setPoint] = useState<VectorLike | null>(null);

  return (<>
    <LinearRGB>
      <InfoBox>Sample points on a mesh using mesh helpers.</InfoBox>
      <Cursor cursor='move' />
      <Camera>
        <SampleCamera onChange={setPoint} />
      
        <Gather
          children={[
            <GLTFData url={url} />
          ]}
          then={([gltf]: [GLTF]) => {
            if (!gltf) return null;

            return (
              <Pass lights>
                <PointLight position={[10, 20, 30]} color={[0.5, 0.0, 0.25]} intensity={40*40} />
                <PointLight position={[10, 20, 30]} color={[1, 0.5, 0.25]} />
                <DirectionalLight position={[-30, -10, 10]} color={[0, 0.5, 1.0]} />

                {point ? (
                  <Gather
                    children={<GLTFGeometry gltf={gltf} />}
                    then={([geometry]: [CPUGeometry]) => (
                      <SampleMesh geometry={geometry} viewPoint={point} />
                    )}
                  />
                ) : null}

                <Environment preset="field" gain={0.5}>
                  <GLTFModel gltf={gltf} />
                </Environment>
              </Pass>
            );
          }}
        />
      </Camera>
    </LinearRGB>
  </>);
};

type SampleCameraProps = {
  onChange: (point: VectorLike) => void,
};

const SampleCamera = (props: SampleCameraProps) => {
  const {onChange} = props;
  const {uniforms} = useViewContext();

  return (
    <HTML style={POPUP_STYLE}>
      <button onClick={() => onChange([...uniforms.viewPosition.current])}>Sample</button>
    </HTML>
  );
}

type SampleMeshProps = {
  geometry: CPUGeometry,
  viewPoint: VectorLike,
};

const SampleMesh = (props: SampleMeshProps) => {
  const {geometry, viewPoint} = props;
  if (!geometry) return null;

  const [culled, samples] = useMemo(() => {
    const culled = cullMesh(geometry, viewPoint);
    const samples = sampleMesh(culled, 500);

    return [culled, samples];
  }, [geometry, viewPoint]);

  return (<>
    <Plot>
      <Point
        positions={samples}
        size={8}
        color={[1, 1, 1, 1]}
        zBias={5}
      />
    </Plot>
    <GeometryData {...culled}>
      {(mesh) => (
        <FaceLayer
          mesh={mesh}
          side="front"
          zBias={5}
          color={[1, 1, 1, 0.25]}
          mode="transparent"
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
