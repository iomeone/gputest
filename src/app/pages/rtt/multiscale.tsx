import type { LC } from '@use-gpu/live';
import type { DataTexture, TextureSource, OffscreenTarget } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';

import React, { Gather, useRef } from '@use-gpu/live';
import { wgsl } from '@use-gpu/shader/wgsl';

import {
  Loop, Pass, Flat, Pick,
  RawTexture, RenderTarget, RenderToTexture, FullScreen,
} from '@use-gpu/workbench';
import {
  UI, Layout, Absolute, Block, Flex, Inline, Text,
} from '@use-gpu/layout';

//
// Classic render-to-texture feedback effect with blur pyramid.
// This uses plain render targets and render passes rather than compute kernels and dispatches.
//
// Notable differences with compute kernels:
// - render passes can only output to one target at a time
// - render shaders return results rather than writing them out manually
// - render shaders do not have a workgroup size and never go out of bounds
// - pixels are addressed using UV coordinates [0...1] rather than [0...N]
//
// Based on http://webglplayground.net/?gallery=reaction-diffusion by Felix Woitzel (@Flexi23)
//

const NOISE_SIZE = 1024;
const LINEAR_SAMPLER: GPUSamplerDescriptor = {
  minFilter: 'linear',
  magFilter: 'linear',
  addressModeU: 'repeat',
  addressModeV: 'repeat',
};

const makeNoiseData = (size: number) => {
  const data = new Uint8Array(size * size * 4);

  let n = size * size;
  for (let i = 0, j = 0; i < n; ++i) {
    data[j++] = Math.random() * 255;
    data[j++] = Math.random() * 255;
    data[j++] = Math.random() * 255;
    data[j++] = 255;
  }

  return {
    data,
    format: "rgba8unorm",
    size: [size, size],
  } as DataTexture;
};

const noiseData = makeNoiseData(1024);

const initializeShader = wgsl`
  @link fn getTargetSize() -> vec2<f32>;
  @link fn getTextureSize() -> vec2<f32>;
  @link fn getTexture(uv: vec2<f32>) -> vec4<f32>;

  @export fn main(uv: vec2<f32>) -> vec4<f32> {
    return getTexture(uv * getTargetSize() / getTextureSize());
  }
`;

const blurXShader = wgsl`
  @link fn getTextureSize() -> vec2<f32>;
  @link fn getTexture(uv: vec2<f32>) -> vec4<f32>;
  
  @export fn main(uv: vec2<f32>) -> vec4<f32> {
    let h = 1.0 / getTextureSize().x;

    var sum = vec4<f32>(0.0);
    sum += getTexture(vec2<f32>(uv.x - 4.0*h, uv.y)) * 0.05;
    sum += getTexture(vec2<f32>(uv.x - 3.0*h, uv.y)) * 0.09;
    sum += getTexture(vec2<f32>(uv.x - 2.0*h, uv.y)) * 0.12;
    sum += getTexture(vec2<f32>(uv.x - 1.0*h, uv.y)) * 0.15;
    sum += getTexture(vec2<f32>(uv.x + 0.0*h, uv.y)) * 0.16;
    sum += getTexture(vec2<f32>(uv.x + 1.0*h, uv.y)) * 0.15;
    sum += getTexture(vec2<f32>(uv.x + 2.0*h, uv.y)) * 0.12;
    sum += getTexture(vec2<f32>(uv.x + 3.0*h, uv.y)) * 0.09;
    sum += getTexture(vec2<f32>(uv.x + 4.0*h, uv.y)) * 0.05;

    return vec4<f32>(sum.xyz / 0.98, 1.0);
  }
`;

const blurYShader = wgsl`
  @link fn getTextureSize() -> vec2<f32>;
  @link fn getTexture(uv: vec2<f32>) -> vec4<f32>;

  @export fn main(uv: vec2<f32>) -> vec4<f32> {
    let h = 1.0 / getTextureSize().y;

    var sum = vec4<f32>(0.0);
    sum += getTexture(vec2<f32>(uv.x, uv.y - 4.0*h)) * 0.05;
    sum += getTexture(vec2<f32>(uv.x, uv.y - 3.0*h)) * 0.09;
    sum += getTexture(vec2<f32>(uv.x, uv.y - 2.0*h)) * 0.12;
    sum += getTexture(vec2<f32>(uv.x, uv.y - 1.0*h)) * 0.15;
    sum += getTexture(vec2<f32>(uv.x, uv.y + 0.0*h)) * 0.16;
    sum += getTexture(vec2<f32>(uv.x, uv.y + 1.0*h)) * 0.15;
    sum += getTexture(vec2<f32>(uv.x, uv.y + 2.0*h)) * 0.12;
    sum += getTexture(vec2<f32>(uv.x, uv.y + 3.0*h)) * 0.09;
    sum += getTexture(vec2<f32>(uv.x, uv.y + 4.0*h)) * 0.05;

    return vec4<f32>(sum.xyz / 0.98, 1.0);
  }
`;

const feedbackShader = wgsl`
  @link fn getTextureSize() -> vec2<f32>;
  @link fn getTexture(uv: vec2<f32>) -> vec4<f32>;

  @link fn getRandomSeed() -> vec4<f32>;
  @link fn getMouse() -> vec2<f32>;

  @link fn getBlur1(uv: vec2<f32>) -> vec4<f32>;
  @link fn getBlur2(uv: vec2<f32>) -> vec4<f32>;
  @link fn getBlur3(uv: vec2<f32>) -> vec4<f32>;
  @link fn getBlur4(uv: vec2<f32>) -> vec4<f32>;

  @link fn getNoise(uv: vec2<f32>) -> vec4<f32>;

  @export fn main(pixel: vec2<f32>) -> vec4<f32> {
    var color = vec4<f32>(0.0, 0.0, 0.0, 1.0);

    let mouse = getMouse();
    let rnd = getRandomSeed();
    let pixelSize = 1.0 / getTextureSize();
  
    let dq   = pixelSize / 4.0;
    let d4   = pixelSize * 4.0;
    let d8   = pixelSize * 8.0;
    let d16  = pixelSize * 16.0;
    let d32  = pixelSize * 32.0;
    let d128 = pixelSize * 128.0;

    let noise = getNoise(pixel + rnd.xy) - 0.5; // the noise texture itself is static. adding randomizing 

    // overall plane deformation vector (zoom-in on the mouse position)

    let center = getMouse() * pixelSize + (rnd.zw - 0.5) * d128; // adding random to avoid artifacts
    var uv = mix(pixel, center, 0.007); // 0.7% zoom in per frame

    // green: very soft reaction-diffusion (skin dot synthesis simulation)

    color.y = getTexture(uv).y + noise.y * 0.0066; // a dash of error diffusion;
    color.y += (getTexture(uv).y - getBlur4(uv).y) * 0.0166; // sort of a Laplacian

    // ^^ yes, that is all the magic for green.

    // blue: just another reaction-diffusion with green as inhibitor, also different color gradients are used as plane deformation vector

    var gy: vec2<f32>; // gradient in green
    gy.x = getBlur2(pixel - vec2<f32>(d8.x, 0.0)).y - getBlur2(pixel + vec2<f32>(d8.x, 0.0)).y;
    gy.y = getBlur2(pixel - vec2<f32>(0.0, d8.y)).y - getBlur2(pixel + vec2<f32>(0.0, d8.y)).y;

    var gz: vec2<f32>; // gradient in blue
    gz.x = getBlur1(pixel - vec2<f32>(d4.x, 0.0)).z - getBlur1(pixel + vec2<f32>(d4.x, 0.0)).z;
    gz.y = getBlur1(pixel - vec2<f32>(0.0, d4.y)).z - getBlur1(pixel + vec2<f32>(0.0, d4.y)).z;

    uv += gy.yx * vec2<f32>(1.0, -1.0) * d4 // gradient in green rotated by 90 degree
      - gy * d16 // gradient in green
      - gz * dq  // gradient of blue - makes the "traveling wave fronts" usually
      + gz.yx * vec2<f32>(-1.0, 1.0) * d4; // rotated gradient of blue - makes the painterly effect here

    color.z = getTexture(uv).z + noise.z * 0.12; // error diffusion
    color.z += (getTexture(uv).z - getBlur3(uv).z) * 0.11; // teh magic :P
    color.z -= (color.y - 0.02) * 0.025;

    // that's all for blue ^^
    // since this became such a beauty, the code for red is mostly a copy, but the inhibitor is inverted to the absence of green

    var gx: vec2<f32>; // gradient in red
    gx.x = getBlur1(uv - vec2<f32>(d4.x, 0.0)).x - getBlur1(uv + vec2<f32>(d4.x, 0.0)).x;
    gx.y = getBlur1(uv - vec2<f32>(0.0, d4.y)).x - getBlur1(uv + vec2<f32>(0.0, d4.y)).x;

    uv += - gy.yx * vec2<f32>(1.0, -1.0) * d8 // gradient in green rotated by 90 degree
      + gy * d32 // gradient in green
      - gx * dq  // gradient of red - makes the "traveling wave fronts" usually
      - gx.yx * vec2<f32>(-1.0, 1.0) * d4; // rotated gradient of red - makes the painterly effect here

    color.x = getTexture(uv).x + noise.x * 0.12; // error diffusion
    color.x += (getTexture(uv).x - getBlur3(uv).x) * 0.11; // reaction diffusion

    color.x -= ((1 - color.y) - 0.02) * 0.025;

    return color;
  };
`;

const compositeShader = wgsl`
  @link fn getTextureSize() -> vec2<f32>;
  @link fn getTexture(uv: vec2<f32>) -> vec4<f32>;
  @link fn getBlur2(uv: vec2<f32>) -> vec4<f32>;
  @link fn getBlur4(uv: vec2<f32>) -> vec4<f32>;

  @export fn main(pixel: vec2<f32>) -> vec4<f32> {
    var color = vec4<f32>(0.0, 0.0, 0.0, 1.0);
    let pixelSize = 1.0 / getTextureSize();

    var d = pixelSize * 1.0;
    var gy: vec2<f32>; // green pixel gradient vector
    gy.x = getTexture(pixel - vec2<f32>(1.,0.)*d).y - getTexture(pixel + vec2<f32>(1.,0.)*d).y;
    gy.y = getTexture(pixel - vec2<f32>(0.,1.)*d).y - getTexture(pixel + vec2<f32>(0.,1.)*d).y;

    d = pixelSize * 4.0;
    var gz: vec2<f32>; // blue blur2 gradient vector
    gz.x += getBlur2(pixel - vec2<f32>(1.,0.)*d).z - getBlur2(pixel + vec2<f32>(1.,0.)*d).z;
    gz.y += getBlur2(pixel - vec2<f32>(0.,1.)*d).z - getBlur2(pixel + vec2<f32>(0.,1.)*d).z;

    color.y = getTexture(pixel + gz*pixelSize*64.).y*0.4 - (gz.x + gz.y)*0.4 + 0.4; // gradient enhancement and refraction
    color.z = getBlur4(pixel + 4.*gy - gz ).z*1.75 -0.0; // scatter/refract

    let bs = 1.0 - getBlur4(pixel).x*2.5; // box shadow
    color.y *= bs;
    color.z *= bs;
    color.x = getTexture(pixel).x*1.+0.25; // repaint over shadow

    color.y += color.x; // red -> yellow

    let s = vec2<f32>(0.75, 1.0) - getBlur4(pixel).z*1.5; // shadow
    color.y *= s.x;
    color.z *= s.y;
    color.z += getTexture(pixel).z*1.5; // repaint over shadow
    color.y += color.z*0.5 - 0.1; // blue -> cyan

    return color;
  }
`

export const RTTMultiscalePage: LC = () => {
  const dpi = window.devicePixelRatio;
  const mouseRef = useRef([window.innerWidth / 2 * dpi, window.innerHeight / 2 * dpi]);
  const getRandomSeed = () => [Math.random(), Math.random(), Math.random(), Math.random()];
  
  return (
    <Gather
      children={[
        <RawTexture data={noiseData} sampler={LINEAR_SAMPLER} />,
        <RenderTarget samples={1} history={1} sampler={LINEAR_SAMPLER} depthStencil={null} />,
        <RenderTarget samples={1} history={1} sampler={LINEAR_SAMPLER} depthStencil={null} />,
        <RenderTarget samples={1} history={1} sampler={LINEAR_SAMPLER} depthStencil={null} resolution={1/2} />,
        <RenderTarget samples={1} history={1} sampler={LINEAR_SAMPLER} depthStencil={null} resolution={1/4} />,
        <RenderTarget samples={1} history={1} sampler={LINEAR_SAMPLER} depthStencil={null} resolution={1/8} />,
      ]}
      then={([
        noiseTexture,
        feedbackTarget,
        blurTarget1,
        blurTarget2,
        blurTarget3,
        blurTarget4,
      ]: [
        TextureSource,
        OffscreenTarget,
        OffscreenTarget,
        OffscreenTarget,
        OffscreenTarget,
        OffscreenTarget,
      ]) => (
        <Flat>
          <Loop live>
            <Pick all move render={({x, y}) => {
              mouseRef.current = [x * dpi, y * dpi];
              return null;
            }} />
            <RenderToTexture target={feedbackTarget}>
              <Pass mode="fullscreen">
                <FullScreen
                  shader={feedbackShader}
                  args={[
                    getRandomSeed,
                    mouseRef,
                  ]}
                  sources={[
                    blurTarget1.source,
                    blurTarget2.source,
                    blurTarget3.source,
                    blurTarget4.source,
                    noiseTexture,
                  ]}
                />
                <FullScreen shader={initializeShader} texture={noiseTexture} initial />
              </Pass>
            </RenderToTexture>

            <RenderToTexture target={blurTarget1}>
              <Pass mode="fullscreen">
                <FullScreen shader={blurXShader} texture={feedbackTarget.source} />
              </Pass>
              <Pass mode="fullscreen">
                <FullScreen shader={blurYShader} />
              </Pass>
            </RenderToTexture>

            <RenderToTexture target={blurTarget2}>
              <Pass mode="fullscreen">
                <FullScreen texture={blurTarget1.source} />
              </Pass>
              <Pass mode="fullscreen">
                <FullScreen shader={blurXShader} />
              </Pass>
              <Pass mode="fullscreen">
                <FullScreen shader={blurYShader} />
              </Pass>
            </RenderToTexture>

            <RenderToTexture target={blurTarget3}>
              <Pass mode="fullscreen">
                <FullScreen texture={blurTarget2.source} />
              </Pass>
              <Pass mode="fullscreen">
                <FullScreen shader={blurXShader} />
              </Pass>
              <Pass mode="fullscreen">
                <FullScreen shader={blurYShader} />
              </Pass>
            </RenderToTexture>

            <RenderToTexture target={blurTarget4}>
              <Pass mode="fullscreen">
                <FullScreen texture={blurTarget3.source} />
              </Pass>
              <Pass mode="fullscreen">
                <FullScreen shader={blurXShader} />
              </Pass>
              <Pass mode="fullscreen">
                <FullScreen shader={blurYShader} />
              </Pass>
            </RenderToTexture>

            <Pass>
              <FullScreen
                texture={feedbackTarget.source}
                shader={compositeShader}
                sources={[
                  blurTarget2.source,
                  blurTarget4.source,
                ]}
              />

              <UI>
                <Layout>
                  <Absolute bottom={10} height={40} left={10} right={0}>
                    <Flex width="100%" height="100%" align="start">
                      <Block fill={[0, 0, 0, .95]} padding={[20, 10]} radius={4}>
                        <Inline>
                          <Text color="rgba(192, 192, 192, 0.8)">Multiscale Reaction Diffusion by Felix Woitzel (@Flexi23)</Text>
                        </Inline>
                      </Block>
                    </Flex>
                  </Absolute>
                </Layout>
              </UI>
            </Pass>
          </Loop>
        </Flat>
      )}
    />
  );
};
