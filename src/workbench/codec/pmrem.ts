import type { LC, LiveElement } from '@use-gpu/live';
import type { TextureSource, TextureTarget } from '@use-gpu/core';
import type { ShaderSource, ShaderModule } from '@use-gpu/shader';

import { memo, gather, yeet, use, useMemo, useOne, useHooks, useNoHooks } from '@use-gpu/live';
import { makeAtlas, clamp, lerp } from '@use-gpu/core';
import { DebugAtlas } from '../text/debug-atlas';
import { Queue } from '../queue/queue';
import { Dispatch } from '../queue/dispatch';
import { Compute } from '../compute/compute';
import { TextureBuffer } from '../compute/texture-buffer';
import { useShader, getShader } from '../hooks/useShader';
import { useDerivedSource, getDerivedSource } from '../hooks/useDerivedSource';
import { useRawSource } from '../hooks/useRawSource';
import { useScratchSource } from '../hooks/useScratchSource';
import { useInspectable } from '../hooks/useInspectable';
import { getRenderFunc } from '../hooks/useRenderProp';

import { pmremInit } from '@use-gpu/wgsl/pmrem/pmrem-init.wgsl';
import { pmremCopy } from '@use-gpu/wgsl/pmrem/pmrem-copy.wgsl';
import { pmremBlur } from '@use-gpu/wgsl/pmrem/pmrem-blur.wgsl';
import { pmremDiffuseSH } from '@use-gpu/wgsl/pmrem/pmrem-diffuse-sh.wgsl';
import { pmremGridOverlay } from '@use-gpu/wgsl/pmrem/pmrem-debug.wgsl';
//import { pmremDiffuseRender } from '@use-gpu/wgsl/pmrem/pmrem-diffuse-render.wgsl';

import { sampleEnvMap } from '@use-gpu/wgsl/pmrem/pmrem-read.wgsl';

const π = Math.PI;
const τ = 2*π;
const sqr = (x: number) => x * x;

const MAX_SAMPLES = 20;

const LINEAR_SAMPLER: GPUSamplerDescriptor = {
  minFilter: 'linear',
  magFilter: 'linear',
};

export type PrefilteredEnvMapProps = {
  texture?: TextureSource | null,
  size?: number,
  levels?: number,
  gain?: number,

  seamFix?: boolean,
  debugGrid?: boolean,
  debugAtlas?: boolean,

  render?: (cubeMap: ShaderSource | null, textureMap: TextureSource | null) => LiveElement,
  children?: (cubeMap: ShaderSource | null, textureMap: TextureSource | null) => LiveElement,
};

// Based on
// https://drive.google.com/file/d/15y8r_UpKlU9SvV4ILb0C3qCPecS8pvLz/view

const getVarianceForRoughness = (roughness: number) => {
  const r = clamp(0, 1, roughness);
  if (r < 0.4) return 1.74 * sqr(sqr(r));
  if (r < 0.8) return 0.575 * r - 0.184;
  return 0.312 * r + 0.027;
};

const MIN_SIGMA = 0.0125;
const MAX_SIGMA = Math.sqrt(getVarianceForRoughness(1));
const PIXEL_PER_SIGMA = 5;

const WEIGHT_CUTOFF = 0.0125;
const SIGMA_CUTOFF = Math.sqrt(-Math.log(WEIGHT_CUTOFF));

const CRISP_SIGMA = 0.3989422804; // 1/sqrt(2π) - normalizes to p(0) == 1

const FIRST_MIP = Math.ceil(PIXEL_PER_SIGMA * (π / 2) / MIN_SIGMA) + 2;
const DIFFUSE_MIP = 127;

const hasWebGPU = typeof GPUBufferUsage !== 'undefined';
const READ_WRITE_SOURCE = hasWebGPU ? { readWrite: true, flags: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC } : {};

export const PrefilteredEnvMap: LC<PrefilteredEnvMapProps> = memo((props: PrefilteredEnvMapProps) => {
  const {
    levels = 8,
    size = 1024,
    gain = 1,
    texture,
    seamFix = true,
    debugGrid = false,
    debugAtlas = false,
  } = props;

  const render = getRenderFunc(props);
  if (!texture) return useHooks(() => render ? render(null, null) : yeet(null), [render]);
  useNoHooks();

  const inspect = useInspectable();

  // Calculate parameters and atlas mappings
  const {atlas, mappings, mips, sigmas, dsigmas, sizes, radii} = useMemo(() => {

    const sigmas = [];
    const dsigmas = [];
    const sizes = [];
    const radii = [];

    // MIP downscale
    const mips = Math.max(1, Math.ceil(Math.log2(size / FIRST_MIP)));
    for (let i = 0; i < mips; ++i) {
      const sigma = CRISP_SIGMA * (τ / 4) / (size >> i);
      sigmas.push(sigma);
      dsigmas.push(0);
      sizes.push(size >> i);
      radii.push(0);
    }

    // Blur downscale
    for (let i = 0; i < levels; ++i) {
      const sigma = Math.pow(2, lerp(Math.log2(MIN_SIGMA), Math.log2(MAX_SIGMA), i / (levels - 1)));
      const size = (Math.ceil(PIXEL_PER_SIGMA * (τ / 4) / sigma) + 1) | 1;

      const last = sigmas[sigmas.length - 1] || 0;
      const dsigma = Math.sqrt(sigma*sigma - last*last);
      const radius = Math.ceil(SIGMA_CUTOFF * dsigma * (size - 1) / (τ / 4));

      if (radius > MAX_SAMPLES) console.warn(`PMREM radius too big: ${radius} > MAX_SAMPLES ${MAX_SAMPLES}`);

      sigmas.push(sigma);
      dsigmas.push(dsigma);
      sizes.push(size);
      radii.push(radius);
    }

    // Lambertian diffuse (for debug/viz)
    sizes.push(DIFFUSE_MIP);

    // Allocate in atlas
    const w = Math.max(sizes[0], FIRST_MIP);
    const h = Math.max(sizes[0], FIRST_MIP) + Math.max(sizes[1], sizes[mips] + sizes[mips + 1]);
    const atlas = makeAtlas(w, h, w*2);

    const mappings = [];
    for (const [i, size] of sizes.entries()) {
      mappings.push(atlas.place(i, size, size));
    }
    atlas.snug();

    return {atlas, mappings, mips, sigmas, dsigmas, sizes, radii};
  }, [size, levels]);

  const {width, height} = atlas;
  return (
    // Allocate target and scratch texture buffers
    gather([
      use(TextureBuffer, {
        width,
        height,
        sampler: LINEAR_SAMPLER,
        format: 'rgba16float',
        filterable: true,
        colorSpace: 'linear',
      }),
      use(TextureBuffer, {
        width: Math.max(size, FIRST_MIP),
        height: Math.max(size, FIRST_MIP),
        sampler: null,
        format: 'rgba16float',
        filterable: true,
        colorSpace: 'linear',
        history: 1,
      }),
    ], ([target, scratch]: TextureTarget[]) => {

      const [textureDump, allocateT] = useScratchSource('vec4<f32>', READ_WRITE_SOURCE);
      allocateT(256 * 256 * 4);

      const diffuseInput = sizes.findIndex(s => s <= 64);
      const [diffuseSHBuffer, allocate] = useScratchSource('vec4<f32>', READ_WRITE_SOURCE);
      allocate(16);

      //const textureRead = useDerivedSource(textureDump, {readWrite: false});
      const shCoefficients = useDerivedSource(diffuseSHBuffer, {readWrite: false});

      const targetIn = useDerivedSource(target, {
        variant: 'textureSampleLevel',
        absolute: true,
      });

      const scratchOut = scratch;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const scratchIn = useDerivedSource(scratch.history![0], {
        variant: 'textureSampleLevel',
        absolute: true,
        sampler: LINEAR_SAMPLER,
      });

      const dispatches = useMemo(() => {

        const out = [];

        const cubeMap = getDerivedSource(texture, {
          variant: 'textureSampleLevel',
        });

        const makeInitShader = () =>
          getShader(pmremInit, [
            mappings[0],
            cubeMap,
            scratchOut,
            target,
            textureDump,
          ]);

        const makeCopyShader = (i: number) =>
          getShader(pmremCopy, [
            mappings[i],
            mappings[i - 1],
            scratchIn,
            scratchOut,
            target,
          ]);

        const makeBlurShader = (i: number, pass: number) =>
          getShader(pmremBlur, [
            mappings[i],
            pass ? mappings[i] : mappings[i - 1],
            dsigmas[i],
            radii[i],
            scratchIn,
            scratchOut,
            target,
          ], {
            BLUR_PASS: pass,
            SIGMA_CUTOFF,
            MAX_SAMPLES,
          });

        const makeDispatch = (shader: ShaderModule, i: number) =>
          use(Dispatch, {
            shader,
            size: [sizes[i], sizes[i]],
            group: [8, 8],
            onDispatch: scratch.swap,
          });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const makeDiffuseDispatch = (i: number, j: number) => [
          use(Dispatch, {
            shader: getShader(pmremDiffuseSH, [
              mappings[i],
              targetIn,
              diffuseSHBuffer,
            ]),
            size: [1, 1],
          }),
          /*
          use(Dispatch, {
            shader: getShader(pmremDiffuseRender, [
              mappings[j],
              diffuseSHBuffer,
              target,
            ]),
            size: [sizes[j], sizes[j]],
            group: [8, 8],
          }),
          use(Readback, {
            source: textureRead,
            then: (data: any) => {
              const n = 256*256*4;
              const out = [];
              const fmt = (x: number) => (x >= 0 ? ' ' : '') + x.toFixed(6);
              for (let i = 0; i < n; i++) {
                out.push(data[i]);
              }
              const norm = data[3];
              console.log(n, JSON.stringify(out), {norm});
            },
          }),
          use(Readback, {
            source: shCoefficients,
            then: (data: any) => {
              const n = data.length;
              const out = [];
              const fmt = (x: number) => (x >= 0 ? ' ' : '') + x.toFixed(6);
              for (let i = 0; i < n; i += 4) {
                out.push(`vec3<f32>(${fmt(data[i])}, ${fmt(data[i+1])}, ${fmt(data[i+2])}),`);
              }
              const norm = data[3];
              console.log(out.join("\n"), {norm});
            },
          }),
          /**/
        ];

        out.push(makeDispatch(makeInitShader(), 0));
        for (let i = 1; i < mips; ++i) out.push(makeDispatch(makeCopyShader(i), i));
        for (let i = 0; i < levels; ++i) for (let j = 0; j < 4; ++j) out.push(makeDispatch(makeBlurShader(i + mips, j), i + mips));
        out.push(...makeDiffuseDispatch(diffuseInput, mips + levels));

        return out;
      }, [sigmas, sizes, radii, mappings, texture, target, scratch]);

      const mappingData = useOne(() => new Uint16Array(mappings.flatMap(m => m)), mappings);
      const varianceData = useOne(() => new Float32Array(sigmas), sigmas);

      const boundMappings = useRawSource(mappingData, 'vec4<u16>');
      const boundVariances = useRawSource(varianceData, 'f32');
      const boundCubeMap = useShader(sampleEnvMap, [
        () => sigmas.length,
        () => gain,
        boundMappings,
        boundVariances,
        targetIn,
        shCoefficients,
        debugGrid ? pmremGridOverlay : null,
      ], {FIX_BILINEAR_SEAM: seamFix, OCTAHEDRAL_OVERLAY: debugGrid});

      inspect({
        output: {
          color: target,
        },
      });

      return useMemo(() => [
        debugAtlas ? use(DebugAtlas, {atlas}) : null,
        use(Queue, {nested: true, children: use(Compute, {children: dispatches}) }),
        render ? render(boundCubeMap, target) : yeet(boundCubeMap),
      ], [debugAtlas, debugGrid, seamFix, atlas, dispatches, render, target, boundCubeMap]);
    })
  );
}, 'PrefilteredEnvMap');
