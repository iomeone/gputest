import type { LC, PropsWithChildren } from '../../../live';
import type { GPUAttributes } from '../../../core';

import React from '../../../live';
import { vec3 } from 'gl-matrix';

import {
  Pass,
  Data, getLineSegments, getArrowSegments,
  OrbitCamera,
  LineLayer, ArrowLayer,
} from '../../../workbench';
import {
  Cursor, OrbitControls,
} from '../../../interact';

import { lineData, zigzagData, arrowData } from './line-data';

import { InfoBox } from '../../ui/info-box';

// Line data fields

const lineSchema = {
  // Use data[n].path as position
  positions: {format: 'array<vec3<f32>>', prop: 'path'},
  // Use data[n].color as color
  colors: {format: 'vec4<f32>', prop: 'color'},
  // Use data[n].width as width
  widths: {format: 'f32', prop: 'width'},
};

const isLineLoop  = (i: number) => lineData[i].loop;
const isArrowLoop  = (i: number) => arrowData[i].loop;

const isStart = (i: number) => arrowData[i].start;
const isEnd   = (i: number) => arrowData[i].end;

export const GeometryLinesPage: LC = () => {
  return (<>
    <InfoBox>Drive &lt;LineLayer&gt; and &lt;ArrowLayer&gt; directly using &lt;Data&gt;, skipping the plot API entirely.</InfoBox>
    <Camera>
      <Cursor cursor='move' />
      <Pass>

        <Data
          schema={lineSchema}
          data={lineData}
          loop={isLineLoop}
          segments={getLineSegments}
        >{
          (props: GPUAttributes) => <LineLayer {...props} depth={0.5} />
        }</Data>

        <Data
          schema={lineSchema}
          data={zigzagData}
          segments={getLineSegments}
        >{
          (props: GPUAttributes) => <LineLayer {...props} depth={0.5} />
        }</Data>

        <Data
          schema={lineSchema}
          data={arrowData}
          loop={isArrowLoop}
          start={isStart}
          end={isEnd}
          segments={getArrowSegments}
        >{
          (props: GPUAttributes) =>
            <ArrowLayer
              {...props}
              depth={0.5}
              sides={4}
              join='tangent'
            />
        }</Data>

      </Pass>
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
