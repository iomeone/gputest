import type { LC, PropsWithChildren } from '../../../live';

import React from '../../../live';
import { CPUGeometry, VectorLike } from '../../../core';

import {
  Pass,
  OrbitCamera,
  LinearRGB,

  FaceLayer,
  GeometryData,
  makePlaneGeometry,
  transformMesh,
} from '../../../workbench';
import {
  getBoundingBox,
  toDataBounds,
} from '../../../core';
import {
  Cursor,
  OrbitControls,
} from '../../../interact';
import {
  QuadTree, QuadTreeKey, QuadTreeNode,
  DistanceLODNode, distanceLODStrategy,
} from '../../../map';
import {
  Transform,
} from '../../../plot';

import { InfoBox } from '../../ui/info-box';

import { mat4, vec3 } from 'gl-matrix';

type QuadTreeData = DistanceLODNode & {
  geometry: CPUGeometry,
  color: VectorLike,
};

const planeGeometry = makePlaneGeometry({width: 2, height: 2, axes: 'xy', detail: [16, 16]});

const fetchTile = async ({x, y, zoom}: QuadTreeKey) => {

  const sz = Math.pow(2, -zoom);
  const dx = -1 + (x + 0.5) * sz * 2;
  const dy = -1 + (y + 0.5) * sz * 2;

  const matrix = mat4.fromValues(
    sz,  0, 0, 0,
     0, sz, 0, 0,
     0,  0, 1, 0,
    dx, dy, 0, 1,
  );

  const color = [Math.random(), Math.random(), Math.random(), 1];
  const geometry = transformMesh(planeGeometry, matrix);

  const {attributes: {positions}} = geometry;
  const n = positions.length / 4;
  for (let i = 0; i < n; ++i) {
    const i4 = i * 4;
    positions[i4 + 2] = Math.random() * .1;
  }

  const bounds = toDataBounds(getBoundingBox(geometry.attributes.positions, 4));

  return {
    geometry,
    bounds,
    color,
  };
};

const lodStrategy = distanceLODStrategy({
  maxLevel: 5,
  tile: 256,
  detail: 1,
});

export const MapQuadTreePage: LC = () => {

  return (<>
    <InfoBox>Rendering a dynamic quad tree of tiles using &lt;QuadTree&gt; helper</InfoBox>
    <Cursor cursor='move' />
    <LinearRGB>
      <Camera>
        <Pass>

          <Transform rotation={[-90, 0, 0]} position={[0, .1, 0]}>
            <QuadTree fetch={fetchTile} strategy={lodStrategy} maxFetches={4} maxCached={1024}>{
              ({key, data: {geometry, color}}: QuadTreeNode<QuadTreeData>) => (
                <GeometryData key={key} {...geometry}>{
                  (mesh) => (
                    <FaceLayer
                      mesh={mesh}
                      side="both"
                      color={color}
                    />
                  )
                }</GeometryData>
              )
            }</QuadTree>
          </Transform>

        </Pass>
      </Camera>
    </LinearRGB>
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
