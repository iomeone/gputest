import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { CPUGeometry, GPUGeometry, StorageSource, LambdaSource } from '@use-gpu/core';

import { use, useMemo } from '@use-gpu/live';
import mapValues from 'lodash/mapValues.js';
import { useRenderProp } from '../hooks/useRenderProp';

import { Data } from './data';

export type GeometryDataProps = CPUGeometry & {
  render?: (source: GPUGeometry) => LiveElement,
  children?: (source: GPUGeometry) => LiveElement,
};

export const GeometryData: LiveComponent<GeometryDataProps> = (props: GeometryDataProps) => {
  const {
    count,
    topology,
    attributes,
    formats,
    unwelded,
  } = props;

  const schema = useMemo(() =>
    mapValues(attributes, (_, k) => ({
      format: `array<${formats[k]}>`,
      index: k === 'indices',
      unwelded: !!unwelded?.[k],
    })),
    [attributes, formats],
  );

  return (
    use(Data, {
      schema,
      data: attributes,
      render: (sources: Record<string, StorageSource | LambdaSource>) => {
        const out = {
          count,
          topology,
          attributes: sources,
          unwelded,
        };
        return useRenderProp(props, out);
      },
    })
  );
};
