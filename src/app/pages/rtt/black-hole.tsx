import type { LC, PropsWithChildren } from '../../../live';
import type { OffscreenRenderContext } from '../../../core';

import React, { Gather } from '../../../live';

import {
  Loop, Pass, Queue,
  CubeCamera, OrbitCamera,
  LinearRGB,
  RenderCubeTarget, RenderToTexture,
  useShader,
  useShaderRef,
  useTimeContext,
} from '../../../workbench';
import {
  Cursor, OrbitControls,
} from '../../../interact';
import {
  Transform,
} from '../../../plot';
import { vec3 } from 'gl-matrix';

import { traceVolumeBH } from './black-hole/black-holewgsl';
import { SphereImpostor } from './black-hole/sphere-imposter';
import { Stars } from '../data/solar-system/bsc';

import { BHControls } from '../../ui/bh-controls';
import { InfoBox } from '../../ui/info-box';

const CUBE_SAMPLER: Partial<GPUSamplerDescriptor> = { minFilter: 'linear', magFilter: 'linear' };

export const RTTBlackHolePage: LC = () => {

  return (<>
    <InfoBox>Render a black hole using a sphere imposter with a raymarching shader, sampling the background as a cubemap.</InfoBox>

    <Gather
      children={[
        <RenderCubeTarget width={2048} label="Cube Target" colorSpace="linear" mip={2} sampler={CUBE_SAMPLER} />
      ]}
      then={([
        renderCubeTarget,
      ]: [
        OffscreenRenderContext,
      ]) => (
        <LinearRGB tonemap="aces">
          <Cursor cursor='move' />

            <Queue nested>
              <RenderToTexture target={renderCubeTarget}>
                <CubeCamera position={[0, 0, 0]} far={1e6}>
                  <Pass>
                    <Stars />
                  </Pass>
                </CubeCamera>
              </RenderToTexture>
            </Queue>

            <Camera>
              <Pass>
                <Loop live decimate={4}>
                  <Transform rotation={[0, 0, 30]}>
                    <Stars />
                    <BHControls>{(options) => (
                      <BlackHoleView
                        {...options}
                        renderCubeTarget={renderCubeTarget}
                      />
                    )}</BHControls>
                  </Transform>
                </Loop>

              </Pass>
            </Camera>

        </LinearRGB>
      )}
    />
  </>);
}

type BlackHoleViewProps = {
  exposure: number,
  seed: number,
  red: number,
  green: number,
  blue: number,
  debug: boolean,
  renderCubeTarget: OffscreenRenderContext,
};

const BlackHoleView: LC<BlackHoleViewProps> = (props: BlackHoleViewProps) => {
  const {exposure, seed, red, green, blue, debug, renderCubeTarget} = props;

  const tc = useTimeContext();

  const e = useShaderRef(exposure);

  const r = useShaderRef(red);
  const g = useShaderRef(green);
  const b = useShaderRef(blue);

  const s = useShaderRef(seed);
  const t = useShaderRef((tc.elapsed / 400000) % 2);

  const boundTrace = useShader(traceVolumeBH, [e, s, t, r, g, b, renderCubeTarget.source]);

  return (
    <SphereImpostor
      radius={32}
      trace={boundTrace}
      debug={debug}
      emissive
      inside
    />
  );
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={8}
    bearing={0.5}
    pitch={0.0}
    minRadius={0.5}
    maxRadius={400}
    render={(radius: number, phi: number, theta: number, target: vec3) =>
      <OrbitCamera
        radius={radius}
        phi={phi}
        theta={theta}
        target={target}
        far={1e6}
      >
        {children}
      </OrbitCamera>
    }
  />
);
