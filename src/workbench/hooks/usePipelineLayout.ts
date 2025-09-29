import { makeBindGroupLayout, makePipelineLayout } from '@use-gpu/core';
import { useMemo, useNoMemo } from '@use-gpu/live';

export const usePipelineLayout = (
  device: GPUDevice,
  entries: GPUBindGroupLayoutEntry[][],
  bindGroup0?: GPUBindGroupLayout,
  bindGroup1?: GPUBindGroupLayout,
) => {
  return useMemo(() => {
    const layouts = entries.map(es => makeBindGroupLayout(device, es));
    const l = (
      bindGroup0 ?
        bindGroup1 ? [bindGroup0, bindGroup1, ...layouts]
        : [bindGroup0, ...layouts]
      : layouts
    );
    return makePipelineLayout(device, l);
  }, [device, entries, bindGroup0, bindGroup1]);
};

export const useNoPipelineLayout = useNoMemo;