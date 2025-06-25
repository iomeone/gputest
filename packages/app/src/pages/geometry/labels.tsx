import type { LC, PropsWithChildren } from '@use-gpu/live';
import type { GPUAttributes } from '@use-gpu/core';

import React from '@use-gpu/live';
import { vec3 } from 'gl-matrix';

import {
  Pass,
  LinearRGB,
  Data, OrbitCamera,
  PointLayer, LabelLayer,
} from '@use-gpu/workbench';
import {
  Cursor, OrbitControls,
} from '@use-gpu/interact';

import { pointData, labelData } from './point-data';

import { InfoBox } from '../../ui/info-box';

// Point data fields

const pointSchema = {
  // Use data[n].position as position
  positions: {format: 'vec3<f32>', prop: 'position'},
  // Use data[n].color as color
  colors: {format: 'vec4<f32>', prop: 'color'},
  // Use data[n].size as size
  sizes: {format: 'f32', prop: 'size'},

  // Note: label strings are not passed as GPU data, but separately as `labelData`
};

export const GeometryLabelsPage: LC = () => {
  return (<>
    <InfoBox>Drive &lt;PointLayer&gt; and &lt;LabelLayer&gt; directly using &lt;Data&gt;, skipping the plot API entirely.</InfoBox>
    <Camera>
      <Cursor cursor='move' />
      <LinearRGB tonemap="aces">
        <Pass>

          <Data
            schema={pointSchema}
            data={pointData}
          >{
            ({positions, colors, sizes}: GPUAttributes) => (<>
              <PointLayer
                positions={positions}
                colors={colors}
                sizes={sizes}
                depth={0.5}
              />
              <LabelLayer
                positions={positions}
                colors={colors}
                labels={labelData}
                size={24}
                depth={1}
                placement={[0, -1]}
                offset={20}
              />
            </>)
          }</Data>

        </Pass>
      </LinearRGB>
    </Camera>
  </>);
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={3}
    bearing={0.5}
    pitch={0.3}
    render={(radius: number, phi: number, theta: number, target: vec3) =>
      <OrbitCamera
        radius={radius}
        phi={phi}
        theta={theta}
        target={target}
        scale={2160}
      >
        {children}
      </OrbitCamera>
    }
  />
);
