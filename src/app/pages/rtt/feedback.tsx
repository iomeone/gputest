import type { LC } from '@use-gpu/live';
import type { Emit, Time } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import React from '@use-gpu/live';
import { wgsl } from '@use-gpu/shader/wgsl';

import {
  Loop, Pass, OrbitCamera, RawData, PointLayer,
  LinearRGB, FullScreen,
} from '@use-gpu/workbench';

import { InfoBox } from '../../ui/info-box';

export const RTTFeedbackPage: LC = () => {
  return (<>
    <InfoBox>Render targets with history can be used to create feedback loops</InfoBox>
    <LinearRGB history={1} sampler={{minFilter: 'linear', magFilter: 'linear'}}>
      <OrbitCamera scale={1080}>
        <Pass>

          <FullScreen shader={
            wgsl`
              @link fn getTexture(uv: vec2<f32>) -> vec4<f32> {}
              @export fn main(uv: vec2<f32>) -> vec4<f32> {
                let advectedUV = (uv - 0.5) * 0.99 + 0.5;
                return getTexture(advectedUV);
              }
            `
          }/>

          <RawData
            format='vec4<f32>'
            length={100}
            items={2}
            interleaved
            live
            time
            expr={(emit: Emit, i: number, time: Time) => {
              const t = time.elapsed / 1000;
              const s = ((i*i + i) % 13133.371) % 1000;

              const x = Math.cos(t * 1.31 + Math.sin((t + s) * 0.31) + s) * 2;
              const y = Math.sin(t * 1.113 + Math.sin((t - s) * 0.414) - s) * 2;
              const z = Math.cos(t * 0.981 + Math.cos((t + s*s) * 0.515) + s*s) * 2;

              const r = Math.abs(x) / 2;
              const g = Math.abs(y) / 2;
              const b = Math.abs(z) / 2;

              emit(x, y, z, 1);
              emit(r, g, b, 0.5);
            }}
          >{
            ([positions, colors]: ShaderSource[]) => (
              <PointLayer
                positions={positions}
                colors={colors}
                shape='circle'
                size={20}
                depth={1}
                mode='transparent'
              />
            )
          }</RawData>

        </Pass>
      </OrbitCamera>
    </LinearRGB>
  </>);
};
