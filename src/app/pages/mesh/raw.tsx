import { LiveComponent } from '../../../live/types';
import { CanvasRenderingContextGPU } from '../../../webgpu/types';
import { DataField, Emitter, StorageSource, ViewUniforms, UniformAttribute, RenderPassMode } from '../../../core/types';

import React from '../../../live/jsx';
import { use, useMemo, useOne, useResource, useState } from '../../../live';

import {
  Loop, Draw, Pass, Flat,
  CompositeData, Data, RawData, Raw, LineSegments,
  OrbitCamera, OrbitControls,
  Pick, Cursor, PointLayer, LineLayer,
  RenderToTexture,
} from '../../../components';
import { Mesh } from '../../components/mesh';
import { makeMesh, makeTexture } from '../../meshes/cube';

export type MeshRawPage = {
  canvas: HTMLCanvasElement,
};

export const MeshRawPage: LiveComponent<MeshRawPageProps> = (props) => {
  const mesh = makeMesh();
  const texture = makeTexture();
  const {canvas} = props;

  const view = (
    <Draw>
      <Cursor cursor='move' />
      <Pass>
        <Pick
          render={({id, hovered, presses}) => [
            <Mesh texture={texture} mesh={mesh} blink={presses.left} />,
            <Mesh id={id} texture={texture} mesh={mesh} mode={RenderPassMode.Picking} />,
            hovered ? <Cursor cursor='pointer' /> : null,
          ]}
        />
      </Pass>
    </Draw>
  );

  return (
    <OrbitControls
      canvas={canvas}
      radius={5}
      bearing={0.5}
      pitch={0.3}
      render={(radius: number, phi: number, theta: number) =>
        <OrbitCamera
          radius={radius}
          phi={phi}
          theta={theta}
        >
          {view}
        </OrbitCamera>
      }
    />
  );
};
