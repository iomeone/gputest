import type { LC } from '@use-gpu/live';
import type { Emit } from '@use-gpu/core';
import { RenderPassMode } from '@use-gpu/core';

import React from '@use-gpu/live';
import { wgsl } from '@use-gpu/shader/wgsl';

import {
  Loop, Draw, Pass, OrbitCamera, RawData, PointLayer, Raw,
  LinearRGB, Feedback,
} from '@use-gpu/workbench';

export const RTTFeedbackPage: LC = () => {
  let t = 0;
  return (
    <Loop>
      <Raw>
        {() => {
          t = t + 1/60;
        }}
      </Raw>
      <LinearRGB history={1} sampler={{minFilter: 'linear', magFilter: 'linear'}}>
        <Pass>
          <OrbitCamera scale={1080}>
            <Feedback shader={
              wgsl`
                @link fn getFeedback(uv: vec2<f32>) -> vec4<f32> {}
                @export fn main(uv: vec2<f32>) -> vec4<f32> {
                  let advectedUV = (uv - 0.5) * 0.99 + 0.5;
                  return getFeedback(advectedUV);
                }
              `
            }/>
          
            <RawData
              format='vec4<f32>'
              length={100}
              items={2}
              interleaved
              live
              expr={(emit: Emit, i: number) => {
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
              render={(positions, colors) => (
                <PointLayer
                  positions={positions}
                  colors={colors}
                  shape='circle'
                  size={20}
                  depth={1}
                  mode={'transparent'}
                />
              )}
            />

          </OrbitCamera>
        </Pass>
      </LinearRGB>
    </Loop>
  );
};
