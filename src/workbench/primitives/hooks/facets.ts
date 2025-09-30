import type { UniformAttribute } from '../../../core';
import type { ShaderSource } from '../../../shader';
import { useSource, useNoSource } from '../../hooks/useSource';

const FACETS: UniformAttribute = { format: 'u32', name: 'getFacet' };

export type FacetSource = {
  facet?: number,
  facets?: ShaderSource,
};

export const useFacetShader = ({facet, facets}: FacetSource) => {
  return facets ?? facet ? useSource(FACETS, facets ?? facet) : (useNoSource(), undefined);
};
