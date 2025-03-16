import type { LC } from '@use-gpu/live';
import type { TextureTarget } from '@use-gpu/core';
import type { PassBinding } from '../../pass/types';

import { gather, yeet, memo, useMemo, useOne } from '@use-gpu/live';
import { makeViewUniforms, updateViewProjection } from '@use-gpu/core';
import { RenderTarget } from '../render-target';

import { useShaderRef } from '../../hooks/useShaderRef';
import { useDeviceContext } from '../../providers/device-provider';
import { useRenderContext } from '../../providers/render-provider';
import { useViewContext, useViewUniforms, useViewBinding } from '../../providers/view-provider';

import { mat4 } from 'gl-matrix';

export type OverscanBufferProps = {
  overscan?: number,
};

export const OverscanBuffer: LC = memo((props: OverscanBufferProps) => {
  const {
    overscan = 0,
  } = props;

  const device = useDeviceContext();
  const renderContext = useRenderContext();

  const [matrix, inverse] = useMemo(() => {
    const {width, height} = renderContext;

    const w1 = width;
    const h1 = height;

    const w2 = width + overscan * 2;
    const h2 = height + overscan * 2;

    const sx = w1 / w2;
    const sy = h1 / h2;

    const dx = (w2 - w1) / w2 / 2;
    const dy = (h2 - h1) / h2 / 2;

    const m = mat4.fromValues(
      sx,  0, 0, 0,
       0, sy, 0, 0,
       0,  0, 1, 0,
      dx, dy, 0, 1,
    );

    const i = mat4.fromValues(
        1/sx,     0, 0, 0,
           0,  1/sy, 0, 0,
           0,     0, 1, 0,
      -dx/sx,-dy/sy, 0, 1,
    );
    
    return [m, i];
  }, [renderContext, overscan]);

  const overscanMatrix = useShaderRef(matrix);
  const inverseOverscanMatrix = useShaderRef(inverse);

  const {uniforms: viewUniforms} = useViewContext();

  const uniforms = useOne(() => {
    const {
      projectionMatrix,
      projectionViewMatrix,
      projectionViewFrustum,
      inverseProjectionMatrix,
      inverseProjectionViewMatrix,
    } = makeViewUniforms();
    
    return {
      ...viewUniforms,
      projectionMatrix,
      projectionViewMatrix,
      projectionViewFrustum,
      inverseProjectionMatrix,
      inverseProjectionViewMatrix,
      overscanMatrix,
      inverseOverscanMatrix,
    };
  }, viewUniforms);

  const {cull} = useViewUniforms(uniforms);
  const {binding, upload} = useViewBinding(uniforms);
  upload();

  const update = () => {
    const {projectionMatrix: {current: projectionMatrix}} = uniforms;

    mat4.multiply(projectionMatrix, matrix, viewUniforms.projectionMatrix.current);
    updateViewProjection(uniforms, projectionMatrix);
    upload();
  };

  return yeet({
    dispatches: [update],
    bindings: { overscan: binding },
    views: { pre: { cull, uniforms }},
  });
}, 'OverscanBuffer');
