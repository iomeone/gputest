import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { ShaderSource } from '@use-gpu/shader';
import type { StorageSource, Geometry } from '@use-gpu/core';

import { use, yeet, useOne } from '@use-gpu/live';
import zipObject from 'lodash/zipObject';

import { Data } from './data';

export type GeometryDataProps = {
  geometry: Geometry,
  render?: (sources: Record<string, ShaderSource>) => LiveElement,
};

export const GeometryData: LiveComponent<GeometryDataProps> = (props: GeometryDataProps) => {
  const {
    geometry: {attributes, formats},
    render,
  } = props;

  const fields = useOne(() =>
    Object.keys(attributes).map(k => [
      formats[k],
      attributes[k],
    ]),
    attributes
  );

  return (
    use(Data, {
      fields,
      render: (...sources: StorageSource[]) => {
        const out = zipObject(Object.keys(attributes), sources);
        return render ? render(out) : yeet(out);
      },
    })
  );
};
