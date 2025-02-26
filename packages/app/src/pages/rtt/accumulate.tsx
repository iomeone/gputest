import type { LC } from '@use-gpu/live';
import type { Emit, Time, Lazy, OffscreenTarget } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import React, { Gather } from '@use-gpu/live';
import { wgsl } from '@use-gpu/shader/wgsl';

import {
  Loop, Pass, OrbitCamera,
  LinearRGB, FullScreen, RenderTarget, AccumulateRender,
  useShader,
} from '@use-gpu/workbench';

import { InfoBox } from '../../ui/info-box';

const accumShader = wgsl`
  @link fn getFrameCount() -> u32 {};
  @link fn getTargetSize() -> vec2<f32> {};

  fn xxhash32_3d(p: vec3<u32>) -> u32 {
    let p2 = 2246822519u; let p3 = 3266489917u;
    let p4 = 668265263u; let p5 = 374761393u;
    var h32 =  p.z + p5 + p.x*p3;
    h32 = p4 * ((h32 << 17) | (h32 >> (32 - 17)));
    h32 += p.y * p3;
    h32 = p4 * ((h32 << 17) | (h32 >> (32 - 17)));
    h32 = p2 * (h32^(h32 >> 15));
    h32 = p3 * (h32^(h32 >> 13));
    return h32^(h32 >> 16);
  }

  @export fn main(uv: vec2<f32>) -> vec4<f32> {
    let k = getFrameCount();

    let ij = vec2<u32>(uv * getTargetSize());
    let ijk = vec3<u32>(ij, k % 256);

    let hash = xxhash32_3d(ijk);
    let noise = f32(hash) / 0xFFFFFFFF;

    return vec4<f32>(vec3<f32>(noise), 1.0);
  }
`;

const compositeShader = wgsl`
  @link fn getAccumulateTexture(uv: vec2<f32>) -> vec4<f32>;
  @link fn getFrameCount() -> u32 {};

  @export fn main(uv: vec2<f32>) -> vec4<f32> {
    let sample = getAccumulateTexture(uv);
    let norm = f32(getFrameCount());

    return vec4<f32>(sample.xyz / norm, 1.0);
  }
`;

export const RTTAccumulatePage: LC = () => {
  return (<>
    <InfoBox>Accumulate into a render target</InfoBox>

    <Gather
      children={[
        <RenderTarget history={1} format="rgba16float" />
      ]}
      then={([
        feedbackTarget
      ]: [
        OffscreenTarget,
      ]) => (

        <LinearRGB tonemap="aces">
          <OrbitCamera scale={1080}>

            <Loop>

              <AccumulateRender
                target={feedbackTarget}
                render={(frame: Lazy<number>) => {
                  const shader = useShader(accumShader, [frame]);
                  return (
                    <Pass overlay>
                      <FullScreen shader={shader} blend="add" />
                    </Pass>
                  );
                }}
                then={(frame: Lazy<number>, converged: Lazy<boolean>) => (
                  <Pass>
                    <FullScreen shader={useShader(compositeShader, [feedbackTarget.source, frame])} />
                  </Pass>
                )}
              />

            </Loop>

          </OrbitCamera>
        </LinearRGB>

      )}
    />

  </>);
};

//render={(frame: Lazy<number>) => [