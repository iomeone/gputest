import type { LC } from '@use-gpu/live';
import type { OverscanOptions, PassBinding, PassView } from '../../pass/types';

import { yeet, memo, useMemo, useOne } from '@use-gpu/live';
import { makeViewUniforms, updateViewProjection } from '@use-gpu/core';

import { useShaderRef } from '../../hooks/useShaderRef';
import { useRenderContext } from '../../providers/render-provider';
import { useViewContext, useViewUniforms, useViewBinding } from '../../providers/view-provider';

import { mat4 } from 'gl-matrix';

export type OverscanBufferProps = {
  overscan: OverscanOptions,
};

export const OverscanBuffer: LC<OverscanBufferProps> = memo((props: OverscanBufferProps) => {
  const {
    overscan: overscanOptions,
  } = props;

  const renderContext = useRenderContext();

  const {range, all} = overscanOptions;
  const [matrix, w, h] = useMemo(() => {
    const {width, height} = renderContext;

    const w1 = width;
    const h1 = height;

    const w2 = width * (1 + range * 2);
    const h2 = height * (1 + range * 2);

    const sx = w1 / w2;
    const sy = h1 / h2;

    const m = mat4.fromValues(
      sx,  0, 0, 0,
       0, sy, 0, 0,
       0,  0, 1, 0,
       0,  0, 0, 1,
    );

    return [m, w2, h2];
  }, [renderContext, range]);

  const overscanMatrix = useShaderRef(matrix);

  const {uniforms: viewUniforms} = useViewContext();

  const uniforms = useOne(() => {
    const {
      projectionMatrix,
      projectionViewMatrix,
      projectionViewFrustum,
      inverseProjectionMatrix,
      inverseProjectionViewMatrix,
      viewSize,
      viewResolution,
    } = makeViewUniforms();
    
    return {
      ...viewUniforms,
      projectionMatrix,
      projectionViewMatrix,
      projectionViewFrustum,
      inverseProjectionMatrix,
      inverseProjectionViewMatrix,
      viewSize,
      viewResolution,
      overscanMatrix,
    };
  }, viewUniforms);

  // Manually set size to avoid altering other units
  uniforms.viewSize.current = [w, h];
  uniforms.viewResolution.current = [1 / w, 1 / h];

  const {cull} = useViewUniforms(uniforms);
  const {binding, upload} = useViewBinding(uniforms);
  upload();

  const update = () => {
    const {projectionMatrix: {current: projectionMatrix}} = uniforms;

    mat4.multiply(projectionMatrix, matrix, viewUniforms.projectionMatrix.current);
    updateViewProjection(uniforms, projectionMatrix);
    upload();
  };

  const bindings: Record<string, PassBinding> = {
    overscan: binding,
  };
  const views: Record<string, PassView> = {
    pre: { cull, uniforms }
  };

  if (all) {
    bindings.view = binding;
    views.view = { cull, uniforms };
  }

  return yeet({
    dispatches: [update],
    bindings,
    views,
  });
}, 'OverscanBuffer');

const DEFAULT_OVERSCAN_OPTIONS = {
  range: 0,
  all: false,
};

export const parseOverscanOptions = (opt: number | OverscanOptions) => ({
  ...DEFAULT_OVERSCAN_OPTIONS,
  ...(
    typeof opt === 'number' ? {range: opt} :
    opt
  ),
});
