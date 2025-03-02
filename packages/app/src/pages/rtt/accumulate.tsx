import type { LC, LiveElement } from '@use-gpu/live';
import type { Emit, Time, Lazy, OffscreenTarget } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import React, { Gather, useVersion } from '@use-gpu/live';
import { seq } from '@use-gpu/core';
import { wgsl } from '@use-gpu/shader/wgsl';

import {
  Loop, Pass, OrbitControls, OrbitCamera, Cursor,
  LinearRGB, FullScreen, RenderTarget, RenderToTexture, AccumulateRender,
  DebugLineHelper, DebugHelper, On, PointLayer, LineLayer,
  
  Compute, Readback,
  useMouse, useKeyboard,
  usePerFrame, useShader, useShaderRef, useRawSource, useViewContext,
} from '@use-gpu/workbench';

import {
  Plot, Point, Line,
} from '@use-gpu/plot';

import { InfoBox } from '../../ui/info-box';

import { accumulateShader } from './accumulate/accumulate.wgsl';
import { compositeShader } from './accumulate/composite.wgsl';

const GROUND = -3;

const rand = () => Math.random();
const randS = () => Math.random() * 2 - 1;

const quadData = new Float32Array([
  -1e2, GROUND, -1e2, 1,
  -1e2, GROUND,  1e2, 1,
   1e2, GROUND,  1e2, 1,
   1e2, GROUND, -1e2, 1,

   rand(), rand(), rand(), 1,
]);

const sphereData = new Float32Array(
  seq(32).flatMap((i) => [
    randS() * 10,
    GROUND + rand() * 5,
    randS() * 10,
    1 + rand() * 2,

    rand(),
    rand(),
    rand(),
    1,
  ])
);

export const RTTAccumulatePage: LC = () => {
  return (<>
    <InfoBox>Accumulate into a render target using a custom path-tracing shader, with live debug visualization</InfoBox>
    <InfoBox bottom={0}>Hold [ALT] to visualize path tracing rays for the selected pixel</InfoBox>

    <Gather
      children={[
        <RenderTarget samples={1} history={1} format="rgba16float" />,
        <DebugLineHelper count={4*1024} />,
      ]}
      then={([
        feedbackTarget,
        debugHelper,
      ]: [
        OffscreenTarget,
      ]) => (

        <LinearRGB tonemap="aces">
          <Cursor cursor="move" />
          <Camera>
            <Loop>
            
              <AccumulateView
                limit={1024}
                target={feedbackTarget}
                render={(frame: Lazy<number>) => <PathTrace frame={frame} debugHelper={debugHelper} />}
                then={(frame: Lazy<number>, converged: Lazy<boolean>) => (
                  <Pass>
                    <FullScreen shader={useShader(compositeShader, [feedbackTarget.source, frame])} />
                    
                    <PointLayer {...debugHelper.attributes} size={5} />
                    <LineLayer {...debugHelper.attributes} width={3} />
                  </Pass>
                )}
              />

              {/*<Compute><Readback source={debugHelper.attributes.counter} then={(d) => console.log(d[0])} /></Compute>*/}

            </Loop>

          </Camera>
        </LinearRGB>

      )}
    />

  </>);
};

type AccumulateViewProps = {
  target: OffscreenTarget,
  limit?: number

  render?: (frame: Lazy<number>) => LiveElement,
  then?: (frame: Lazy<number>, converged: Lazy<boolean>) => LiveElement,
};

const AccumulateView = (props: AccumulateViewProps) => {
  const {target, limit, render, then} = props;

  const {keyboard: {keys}} = useKeyboard();

  const keysVersion = useVersion(keys.alt);
  const viewVersion = useViewVersion();

  const version = keysVersion + viewVersion;

  return (
    <AccumulateRender
      continued
      target={target}
      limit={limit}
      version={version}
      render={render}
      then={then}
    />
  );
};

const useViewVersion = () => {
  usePerFrame();
  const {uniforms} = useViewContext();
  const {viewMatrix: {current: viewMatrix}} = uniforms;
  const version = useVersion(viewMatrix);

  return version;
};

type PathTraceProps = {
  frame: Lazy<number>,
  debugHelper: DebugHelper,
};

const PathTrace = (props: PathTraceProps) => {
  const {frame, debugHelper} = props;
  
  const {mouse} = useMouse();
  const {keyboard: {keys}} = useKeyboard();

  const quadSource = useRawSource(quadData, 'vec4<f32>');
  const sphereSource = useRawSource(sphereData, 'vec4<f32>');

  const dpi = window.devicePixelRatio;
  const pickRef = useShaderRef(!!keys.alt);
  const mouseRef = useShaderRef([mouse.x * dpi, mouse.y * dpi]);

  const shader = useShader(accumulateShader, [
    frame,
    () => quadSource.length,
    quadSource,
    () => sphereSource.length,
    sphereSource,

    // Mouse debug picking
    mouseRef,
    pickRef,
    debugHelper.shaders.emitPoint,
    debugHelper.shaders.emitLine,
  ], {HAS_DEBUG_PICKING: true});

  var frameCount = 0;

  return (
    <Pass overlay>
      {keys.alt ? <On render={() => frameCount++ === 0 && debugHelper.swap()} /> : null}
      <FullScreen shader={shader} blend="premultiply" alphaToDiscard={false} />
    </Pass>
  );
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={30}
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
