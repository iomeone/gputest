import type { LC, LiveElement } from '@use-gpu/live';
import type { StorageSource } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

import { yeet, useMemo, useOne } from '@use-gpu/live';
import { clearBuffer } from '@use-gpu/core';
import { bindEntryPoint } from '@use-gpu/shader/wgsl';
import { useDeviceContext } from '../providers/device-provider';
import { getDerivedSource } from '../hooks/useDerivedSource';
import { useScratchSource } from '../hooks/useScratchSource';
import { getShader } from '../hooks/useShader';
import { useRawSource } from '../hooks/useRawSource';

import debugWGSL from '@use-gpu/wgsl/debug/line-helper.wgsl';

export type DebugHelper = {
  target: Record<string, StorageSource>,
  attributes: Record<string, StorageSource>,
  swap: () => void,
  shaders: {
    emitPoint: ShaderSource,
    emitLine: ShaderSource,
  },
};

export type DebugLineHelperProps = {
  count?: number,
  render: (helper: DebugHelper) => LiveElement,
};

const hasWebGPU = typeof GPUBufferUsage !== 'undefined';
const READ_WRITE_SOURCE = hasWebGPU ? { readWrite: true, flags: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC } : {};

export const DebugLineHelper: LC<DebugLineHelperProps> = (props: DebugLineHelperProps) => {
  const {
    count = 1024,
    render,
  } = props;

  const atomicArray   = useOne(() => new Uint32Array(16));
  const atomicStorage = useRawSource(atomicArray, 'u32', READ_WRITE_SOURCE);

  const [debugPositions, allocatePositions] = useScratchSource('vec4<f32>', READ_WRITE_SOURCE);
  const [debugColors,    allocateColors]    = useScratchSource('vec4<f32>', READ_WRITE_SOURCE);
  const [debugSegments,  allocateSegments]  = useScratchSource('i32', READ_WRITE_SOURCE);
  allocatePositions(count);
  allocateColors(count);
  allocateSegments(count);

  const device = useDeviceContext();

  const helper = useMemo(() => {
    const swap = () => {
      clearBuffer(device, debugPositions.buffer);
      clearBuffer(device, debugColors.buffer);
      clearBuffer(device, debugSegments.buffer);
      clearBuffer(device, atomicStorage.buffer);
    }

    const attributes = {
      counter: getDerivedSource(atomicStorage, { readWrite: false, format: 'u32' }),
      positions: getDerivedSource(debugPositions, { readWrite: false }),
      colors: getDerivedSource(debugColors, { readWrite: false }),
      segments: getDerivedSource(debugSegments, { readWrite: false }),
    };

    const target = {
      counter: atomicStorage,
      positions: debugPositions,
      colors: debugColors,
      segments: debugSegments,
    };

    const boundEmitter = getShader(debugWGSL, [target.counter, target.positions, target.colors, target.segments]);
    const emitPoint = bindEntryPoint(boundEmitter, 'emitPoint');
    const emitLine = bindEntryPoint(boundEmitter, 'emitLine');
    const shaders = {emitPoint, emitLine};

    return {target, attributes, shaders, swap};
  }, [device, atomicStorage, atomicArray, debugPositions, debugSegments]);

  return render ? render(helper) : yeet(helper);
};
