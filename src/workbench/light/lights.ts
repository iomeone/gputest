import type { LiveFiber, LiveMap, LC, PropsWithChildren } from '@use-gpu/live';
import type { TypedArray, StorageSource } from '@use-gpu/core';
import type { ShaderModule } from '@use-gpu/shader';
import type { Light } from './types';

import { LightContext } from '../providers/light-provider';
import { useDeviceContext } from '../providers/device-provider';

import { capture, provide, gather, keyed, makeCapture, captureValues, useCapture, useMemo, useOne } from '@use-gpu/live';
import { bindBundle, bundleToAttribute, bundleToAttributes, getBundleKey } from '@use-gpu/shader/wgsl';
import { makeUniformLayout, makeLayoutFiller, makeLayoutData, makeStorageBuffer, uploadBuffer } from '@use-gpu/core';
import { useBufferedSize } from '../hooks/useBufferedSize';
import { getBoundShader } from '../hooks/useBoundShader';

import { Light as WGSLLight } from '@use-gpu/wgsl/use/types.wgsl';
import { applyLight as applyLightWGSL } from '@use-gpu/wgsl/material/light.wgsl';
import { applyLights as applyLightsWGSL } from '@use-gpu/wgsl/material/lights.wgsl';

export const LightCapture = makeCapture<Light>('LightCapture');

export const useLightCapture = (light: Light) => useCapture(LightCapture, light);

const LIGHT_BINDINGS = bundleToAttributes(applyLightWGSL);
const LIGHTS_BINDINGS = bundleToAttributes(applyLightsWGSL);

const LIGHT_ATTRIBUTE = bundleToAttribute(WGSLLight);
const LIGHT_LAYOUT = makeUniformLayout(LIGHT_ATTRIBUTE.members!);

export type LightsProps = {
  max?: number,
};

export const Lights: LC<LightsProps> = (props: PropsWithChildren<LightsProps>) => {
  const {
    max = 64,
    children,
  } = props;
  
  const device = useDeviceContext();

  // Make light storage buffer + shader
  const [context, storage, data] = useMemo(() => {
    const data = makeLayoutData(LIGHT_LAYOUT, max);
    const buffer = makeStorageBuffer(device, data);

    const storage = {
      buffer,
      format: WGSLLight,
      length: 0,
      size: [0],
      version: 1,
    } as any as StorageSource;

    const bindMaterial = (applyMaterial: ShaderModule) => {
      const applyLight = bindBundle(applyLightWGSL, {applyMaterial});
      return getBoundShader(applyLightsWGSL, LIGHTS_BINDINGS, [() => storage.length, storage, applyLight]);
    };

    const useMaterial = (applyMaterial: ShaderModule) =>
      useMemo(() => bindMaterial(applyMaterial), [bindMaterial, applyMaterial]);

    const context = {bindMaterial, useMaterial};

    return [context, storage, data];
  }, [device, max]);

  // Provide light shader downstream
  const render = provide(LightContext, context, children);

  // Gather lights from children
  return capture(LightCapture, render, (map: LiveMap<Light>) => {
    let lights = captureValues(map);

    if (lights.length > 0) lights = lights.slice(0, max);
    storage.size[0] = storage.length = lights.length;

    // Group by transform
    const keyFor = (transform?: ShaderModule | null) => transform ? getBundleKey(transform) : 0;
    const grouped = new Map<number, Light[]>();
    for (const light of lights) {
      const key = keyFor(light.transform);
      let list = grouped.get(key);
      if (!list) grouped.set(key, list = []);
      list.push(light);
    }

    // Emit light data
    let base = 0;
    const render = Array.from(grouped.keys()).map((key: number) => {
      const lights = grouped.get(key)!;
      const b = base;
      base += lights.length;
      return keyed(LightEmitter, key, {storage, lights, data, base: b});
    });

    return gather(render, () => {
      uploadBuffer(device, storage.buffer, data);
      return null;
    });
  });
};

export type LightEmitterProps = {
  storage: StorageSource,
  lights: Light[],
  data: ArrayBuffer,
  base: number,
};

export const LightEmitter: LC<LightEmitterProps> = (props: LightEmitterProps) => {
  const {storage, lights, data, base} = props;
  const [{transform}] = lights;

  const filler = useOne(() => makeLayoutFiller(LIGHT_LAYOUT, data), data);

  let i = base;
  for (const light of lights) filler.setData(i++, light);

  if (transform) {
    // TODO: dispatch compute to transform light positions/normals/tangents/sizes
    console.warn('lights are being transformed - unimplemented');
  }

  return null;
};
