import { makeBindGroupLayout, makePipelineLayout } from '@use-gpu/core';
import { useMemo, useNoMemo } from '@use-gpu/live';

export const usePipelineLayout = (
  device: GPUDevice,
  entries: GPUBindGroupLayoutEntry[][],
  bindGroup0?: GPUBindGroupLayout | null,
  bindGroups?: GPUBindGroupLayout[],
  label?: string,
) => {
  return useMemo(() => {
    const layouts = entries.map((es, i) => {
      const l = [label, `group(${i})`].filter(s => s != null).join('/');
      return makeBindGroupLayout(device, es, l);
    });

    const allGroups = (
      bindGroup0 ?
        bindGroups ? [bindGroup0, ...layouts, ...bindGroups]
        : [bindGroup0, ...layouts]
      : layouts
    );

    return makePipelineLayout(device, allGroups, label);
  }, [device, entries, bindGroup0, bindGroups, label]);
};

export const useNoPipelineLayout = useNoMemo;