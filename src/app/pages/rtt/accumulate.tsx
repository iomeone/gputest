import type { LC, LiveElement, PropsWithChildren } from '../../../live';
import type { Lazy, OffscreenTarget } from '../../../core';

import React, { Gather, useMemo, useOne, useRef, useVersion } from '../../../live';
import { seq } from '../../../core';
import { vec3 } from 'gl-matrix';

import {
  Loop, Pass, OrbitCamera,
  LinearRGB, FullScreen, RenderTarget, AccumulateRender,
  PrintHelper, PrintLayer, ShaderPrinter, On,

  useMouseState, useKeyboardState,
  usePerFrame, useShader, useShaderRef, useRawSource, useViewContext,
} from '../../../workbench';
import {
  Cursor, OrbitControls,
} from '../../../interact';

import { InfoBox } from '../../ui/info-box';

import { accumulateShader } from './accumulate/accumulatewgsl';
import { compositeShader } from './accumulate/compositewgsl';

// Simple raw test scene of ground + spheres
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
  seq(32).flatMap(() => [
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
        <RenderTarget samples={1} format="rgba16float" label="Accumulation Buffer" colorSpace="linear" />,
        <PrintHelper count={4*1024} />,
      ]}
      then={([
        feedbackTarget,
        printHelper,
      ]: [
        OffscreenTarget,
        ShaderPrinter,
      ]) => (

        <LinearRGB tonemap="aces">
          <Cursor cursor="move" />
          <Camera>
            {/* Use `decimate` to slow down accumulation loop by factor N, e.g. for debugging */}
            <Loop decimate={1}>

              <AccumulateView
                limit={1024}
                target={feedbackTarget}
                render={(frame: Lazy<number>) => <PathTrace frame={frame} printHelper={printHelper} />}
                then={(frame: Lazy<number>) => (
                  <Pass>
                    <FullScreen shader={useShader(compositeShader, [feedbackTarget.source, frame])} />
                    <PrintLayer helper={printHelper} size={5} width={3} />
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

type AccumulateViewProps = {
  target: OffscreenTarget,
  limit?: number

  render?: (frame: Lazy<number>) => LiveElement,
  then?: (frame: Lazy<number>, converged: Lazy<boolean>) => LiveElement,
};

const AccumulateView = (props: AccumulateViewProps) => {
  const {target, limit, render, then} = props;

  const keyboard = useKeyboardState();

  const keysVersion = useVersion(keyboard.alt);
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
  const {uniforms: {viewMatrix: {current: viewMatrix}}} = useViewContext();
  const version = useVersion(viewMatrix);

  return version;
};

type PathTraceProps = {
  frame: Lazy<number>,
  printHelper: ShaderPrinter,
};

const defs = {HAS_DEBUG_PICKING: true}

const PathTrace = (props: PathTraceProps) => {
  const {frame, printHelper} = props;

  const mouse = useMouseState();
  const keyboard = useKeyboardState();

  const quadSource = useRawSource(quadData, 'vec4<f32>');
  const sphereSource = useRawSource(sphereData, 'vec4<f32>');

  const dpi = window.devicePixelRatio;
  const pickRef = useShaderRef(!!keyboard.alt);
  const mouseRef = useShaderRef([mouse.x * dpi, mouse.y * dpi]);

  const shader = useShader(accumulateShader, [
    frame,
    quadSource.length,
    quadSource,
    sphereSource.length,
    sphereSource,

    // Mouse debug picking
    mouseRef,
    pickRef,
    printHelper.shaders.printPoint,
    printHelper.shaders.printLine,
  ], defs);

  // Clear debug info on frame 0
  const frameCountRef = useRef(0);

  // When starting new capture
  useOne(() => {
    if (keyboard.alt) { frameCountRef.current = 0 }
  }, keyboard.alt);

  // When moving mouse during capture
  useOne(() => {
    if (keyboard.alt) frameCountRef.current = 0;
  }, mouse);

  // Avoid trashing render due to mouse move
  return useMemo(() => {
    return (
      <Pass overlay>
        <On render={() => frameCountRef.current++ === 0 && printHelper.swap()} />
        {/* Use of premultiplied blend allows the shader
            to choose whether to overwrite (alpha=1) or accumulate (alpha=0)
            without needing a separate clear op */}
        <FullScreen shader={shader} blend="premultiply" alphaToDiscard={false} />
      </Pass>
    );
  }, [printHelper, shader]);
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
