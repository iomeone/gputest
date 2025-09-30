import type { LC } from '@use-gpu/live';
import type { Emit, StorageTarget } from '@use-gpu/core';

import React, { Gather, use, useMemo } from '@use-gpu/live';
import { wgsl } from '@use-gpu/shader/wgsl';

import {
  Loop, FlatCamera, Pass, OrbitCamera, RawData, PointLayer, Pick,
  ComputeBuffer, Compute, Stage, Iterate, Kernel, Suspense, RawFullScreen,
  useShader, useLambdaSource, useShaderRefs,
} from '@use-gpu/workbench';
import {
  UI, Layout, Absolute, Block, Element, Inline, Text,
} from '@use-gpu/layout';

import { main as generateInitial }  from './cfd-compute/initial.wgsl';
import { main as pushVelocity }     from './cfd-compute/push.wgsl';
import { main as updateDivCurl }    from './cfd-compute/divergence-curl.wgsl';
import { main as updatePressure }   from './cfd-compute/pressure.wgsl';
import { main as projectVelocity }  from './cfd-compute/project.wgsl';
import { main as advectVelocity }   from './cfd-compute/advect.wgsl';
import { main as advectMcCormack }  from './cfd-compute/mccormack.wgsl';

import { CFDControls } from '../../ui/cfd-controls';
import { InfoBox } from '../../ui/info-box';

//
// A pure compute-shader implementation of fluid dynamics,
// which uses raw arrays as storage rather than textures.
//
// Notable differences with render passes:
// - compute is dispatched one workgroup size at a time and may go out of bounds
// - compute can output data to any number of targets
// - compute writes out results manually
// - pixels are addressed using absolute coordinates [0...N] rather than UV [0...1]
//
// As compute buffers are flat 1D arrays, we have to manually serialize (X,Y) coordinates
// to/from a linear index.
//

const colorizeShader = wgsl`
  @link fn getSample(i: u32) -> vec4<f32> {};
  @link fn getSize() -> vec4<u32> {};

  fn main(uv: vec2<f32>) -> vec4<f32> {
    let size = getSize();
    let iuv = vec2<u32>(uv * vec2<f32>(size.xy));
    let i = iuv.x + iuv.y * size.x;

    let value = getSample(i);
    let tone = normalize(vec3<f32>(0.5 + value.xy, 1.0));
    let color = vec3<f32>(
      tone.x * tone.x * tone.z + tone.y * tone.y * tone.y,
      tone.y * tone.z,
      tone.z + tone.y * tone.y
    ) * value.z;

    let b = color.b;
    let boost = vec3<f32>(b*b*b*.25, b*b*.25 + b*.125, 0.0);
    let mapped = (1.0 - 1.0 / (max(vec3<f32>(0.0), (color + boost*0.5) * 2.0) + 1.0));

    return vec4<f32>(mapped, 1.0);
  }
`;

const debugShader = wgsl`
  @link fn getSample(i: u32) -> vec4<f32> {};
  @link fn getSize() -> vec4<u32> {};
  @optional @link fn getGain() -> f32 { return 1.0; };

  fn main(uv: vec2<f32>) -> vec4<f32> {
    let gain = getGain();
    let size = getSize();
    let iuv = vec2<u32>(uv * vec2<f32>(size.xy));
    let i = iuv.x + iuv.y * size.x;

    let value = getSample(i).x * gain;
    return sqrt(vec4<f32>(value, max(value * .1, max(0.0, -value * .3)), max(0.0, -value), 1.0));
  }
`;

export const RTTCFDComputePage: LC = () => {

  const dpi = window.devicePixelRatio;

  const advectForwards = useShader(advectVelocity, [], {TIME_STEP: 1.0});
  const advectBackwards = useShader(advectVelocity, [], {TIME_STEP: -1.0});

  const root = document.querySelector('#use-gpu .canvas');

  return (<>
    <InfoBox>Fluid dynamics simulation using a compute shader on storage buffers</InfoBox>
    <CFDControls
      container={root}
      hasInspect
      render={({inspect}) =>

        <Gather
          key="cfd-compute"
          children={[
            // Velocity + density field
            <ComputeBuffer
              format="vec4<f32>"
              history={3}
              resolution={1/2}
            />,
            // Divergence
            <ComputeBuffer
              format="f32"
              resolution={1/2}
            />,
            // Curl
            <ComputeBuffer
              format="f32"
              resolution={1/2}
            />,
            // Pressure
            <ComputeBuffer
              format="f32"
              history={1}
              resolution={1/2}
            />
          ]}
          then={([
            velocity,
            divergence,
            curl,
            pressure,
          ]: StorageTarget[]) => (<>

            <Pick all move render={({x, y, moveX, moveY}) => (
              <Compute immediate>
                <Stage target={velocity}>
                  <Kernel shader={pushVelocity} args={[[x / 2 * dpi, y / 2 * dpi], [moveX, moveY]]} swap={false} />
                </Stage>
              </Compute>
            )} />

            <Loop live>

              <Compute>
                <Suspense>
                  <Stage targets={[divergence, curl]}>
                    <Kernel shader={updateDivCurl} source={velocity} />
                  </Stage>
                  <Stage target={pressure}>
                    <Iterate count={50}>
                      <Kernel shader={updatePressure} source={divergence} history />
                    </Iterate>
                  </Stage>
                  <Stage target={velocity}>
                    <Kernel shader={generateInitial} initial args={[Math.random()]} />
                    <Kernel shader={projectVelocity} source={pressure} history />
                    <Kernel shader={advectForwards}  history />
                    <Kernel shader={advectBackwards} history />
                    <Kernel shader={advectMcCormack} source={curl} history />
                  </Stage>
                </Suspense>
              </Compute>

              <FlatCamera>
                <Pass>

                  <VisualizeField field={velocity} />

                  {inspect ? (
                    <UI>
                      <Layout>
                        <Absolute left={0} top={0}>
                          <Block direction="x">
                            <Block border={1} padding={1} stroke='#444' fill="#000">
                              <DebugField field={divergence} gain={300} />
                              <Inline align="center"><Text lineHeight={28} color="#ccc">Divergence</Text></Inline>
                            </Block>
                            <Block border={[0, 1, 1, 1]} padding={1} stroke='#444' fill="#000">
                              <DebugField field={curl} gain={10} />
                              <Inline align="center"><Text lineHeight={28} color="#ccc">Curl</Text></Inline>
                            </Block>
                            <Block border={[0, 1, 1, 1]} padding={1} stroke='#444' fill="#000">
                              <DebugField field={pressure} gain={3} />
                              <Inline align="center"><Text lineHeight={28} color="#ccc">Pressure</Text></Inline>
                            </Block>
                          </Block>
                        </Absolute>
                      </Layout>
                    </UI>
                  ) : null}

                </Pass>
              </FlatCamera>

            </Loop>
          </>)}
      />
    } />
  </>);
};

const VisualizeField = ({field}: {field: StorageTarget}) => {
  const boundShader = useShader(colorizeShader, [field, () => field.size, 1]);
  const textureSource = useLambdaSource(boundShader, field);
  return (
    <RawFullScreen texture={textureSource} />
  );
};

const DebugField = ({field, gain}: {field: StorageTarget, gain: number}) => {
  const dpi = window.devicePixelRatio;
  const boundShader = useShader(debugShader, [field, () => field.size, gain || 1]);
  const textureSource = useLambdaSource(boundShader, field);
  return (
    <Element width={field.size[0] / 2 / dpi} height={field.size[1] / 2 / dpi} image={{fit: 'scale'}} texture={textureSource} />
  );
};