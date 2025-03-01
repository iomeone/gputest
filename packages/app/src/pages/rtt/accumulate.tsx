import type { LC } from '@use-gpu/live';
import type { Emit, Time, Lazy, OffscreenTarget } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import React, { Gather } from '@use-gpu/live';
import { wgsl } from '@use-gpu/shader/wgsl';

import {
  Loop, Pass, OrbitControls, OrbitCamera,
  LinearRGB, FullScreen, RenderTarget, RenderToTexture, AccumulateRender,
  useShader, useRawSource,
} from '@use-gpu/workbench';

import {
  Plot, Point, Line,
} from '@use-gpu/plot';

import { InfoBox } from '../../ui/info-box';

import { accumulateShader } from './accumulate/accumulate.wgsl';
import { compositeShader } from './accumulate/composite.wgsl';

const quadData = new Float32Array([
  -1e2, -1, -1e2, 1,
  -1e2, -1,  1e2, 1,
   1e2, -1,  1e2, 1,
   1e2, -1, -1e2, 1,
]);

const sphereData = new Float32Array([
  10, 0, 0, 1,
  10, 0, 0, 1,
  -10, 0, 0, 1,
  0, 10, 0, 1,
  0, -10, 0, 1,
  0, 0, 10, 1,
  0, 0, -10, 1,
]);

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
          <Camera>
            <Loop decimate={60}>

              <AccumulateRender
                limit={256}
                target={feedbackTarget}
                render={(frame: Lazy<number>) => <PathTrace frame={frame} />}
                then={(frame: Lazy<number>, converged: Lazy<boolean>) => (
                  <Pass>
                    <FullScreen shader={useShader(compositeShader, [feedbackTarget.source, () => 1])} />

                    <Plot>
                      <Line
                        positions={quadData}
                        color={"#ffffff"}
                        width={5}
                        loop
                      />
                      <Point
                        positions={sphereData}
                        color={"#ffffff"}
                        size={5}
                        loop
                      />
                    </Plot>
                  </Pass>
                )}
              />

            </Loop>

          </Camera>
        </LinearRGB>

      )}
    />

  </>);
};

type PathTraceProps = {
  frame: Lazy<number>
};

const PathTrace = (props: PathTraceProps) => {
  const {frame} = props;

  const quadSource = useRawSource(quadData, 'vec4<f32>');
  const sphereSource = useRawSource(sphereData, 'vec4<f32>');

  const shader = useShader(accumulateShader, [
    frame,
    () => quadSource.length,
    quadSource,
    () => sphereSource.length,
    sphereSource,
  ]);

  return (
    <Pass overlay>
      <FullScreen shader={shader} blend="premultiply" alphaToDiscard={false} />
    </Pass>
  );
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
