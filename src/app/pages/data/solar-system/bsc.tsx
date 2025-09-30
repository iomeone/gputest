import type { LC } from '../../../../live';
import type { GPUAttributes } from '../../../../core';
import type { ShaderSource } from '../../../../shader';

import React from '../../../../live';
import {
  Fetch,
  Data,
  ValueShader,
  PointLayer,
} from '../../../../workbench';
import { bv2rgb } from './bv2rgbwgsl';


const isDevelopment = process.env.NODE_ENV === 'development';
const base = isDevelopment ? '/' : '/demo/';

const π = Math.PI;

// Bright star catalog
const BRIGHT_STAR_CATALOG_URL = base + 'data/bsc.json';

// Equatorial to Ecliptic
const ε = 23.4392794444 * π / 180;
const cε = Math.cos(ε);
const sε = Math.sin(ε);

export type BSC = {
  ra: number,
  dec: number,
  bv: number,
  vmag: number,
};

const bscSchema = {
  positions: 'vec4<f32>',
  colors: 'vec4<f32>',
};

const makeBSCGetters = (data: BSC[]) => ({
  positions: (i: number) => {
    // Right Ascenscion / Declination
    const {ra, dec} = data[i];

    const ca = Math.cos(ra);
    const sa = Math.sin(ra);
    const cd = Math.cos(dec);
    const sd = Math.sin(dec);

    // Equatorial
    const x1 = ca * cd;
    const y1 = sa * cd;
    const z1 = sd;

    // Ecliptic
    const x2 = 1e5 * (x1);
    const y2 = 1e5 * (y1 * cε - z1 * sε);
    const z2 = 1e5 * (y1 * sε + z1 * cε);

    return [x2, y2, z2, 1];
  },
  colors: (i: number) => {
    // Use BV + VMag as RG color and adapt in a shader.
    const {bv, vmag} = data[i];
    return [bv || 0, vmag, 0, 1];
  },
});

export const Stars: LC = () => {
  // The star catalog is rendered directly as a PointLayer, bypassing the plot API,
  // as it's static.
  return (
    <Fetch url={BRIGHT_STAR_CATALOG_URL} type="json">{
      (data: BSC[]) => (
        <Data
          count={data.length}
          schema={bscSchema}
          virtual={makeBSCGetters(data)}
        >{(sources: GPUAttributes) =>
          // Use a shader to recolor BV + visual magnitude into RGB.
          <ValueShader shader={bv2rgb} source={sources.colors}>{
            (colors: ShaderSource) => (
              <PointLayer {...sources} colors={colors} size={2} />
            )
          }</ValueShader>
        }
        </Data>
      )
    }</Fetch>
  );
};