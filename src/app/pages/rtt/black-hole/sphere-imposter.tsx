import type { LC, Ref } from '../../../../live';
import type { CPUGeometry, GPUGeometry, VectorLike } from '../../../../core';
import type { ShaderModule } from '../../../../shader';
import type { PipelineOptions } from '../../../../workbench';

import { seq } from '../../../../core';
import { gather, use, memo, useCallback, useMemo, useOne } from '../../../../live';
import {
  useMatrixContext,
  useShader, useNoShader, useLambdaSource, useShaderRef,
  useEnvironmentContext, useNoEnvironmentContext,
  FaceLayer, GeometryData, ShaderFlatMaterial, ShaderLitMaterial,
  makeSphereGeometry,
} from '../../../../workbench';
import { bindEntryPoint } from '../../../../shader/wgsl';
import { Primitive } from '../../../../scene';

import { applyPBRMaterial } from '../../../../wgsl/material/pbr-applywgsl';
import { applyPBREnvironment } from '../../../../wgsl/material/pbr-environmentwgsl';

import { getImpostorVertex } from './vertex-impostorwgsl';
import { getSphereImpostorSurface, getSphereImpostorEmissive } from './surface-sphere-impostorwgsl';

import { vec3, mat3, mat4 } from 'gl-matrix';

export type SphereImpostorProps = Partial<Pick<PipelineOptions, 'blend' | 'mode'>> & {
  center?: VectorLike,
  radius?: number,

  segments?: number,
  geometry?: CPUGeometry,
  trace?: ShaderModule,

  emissive?: boolean,
  inside?: boolean,
  debug?: boolean,
};

const ORIGIN = [0, 0, 0];

export const SphereImpostor: LC<SphereImpostorProps> = memo((props: SphereImpostorProps) => {
  const {
    center = ORIGIN,
    radius = 1,

    geometry,
    segments = 8,
    trace,
    blend,
    mode,

    emissive,
    inside,
    debug,
  } = props;

  const size = useOne(() => seq(3).map(() => radius ?? 1), radius);

  const c = useShaderRef(center);
  const s = useShaderRef(size);

  const resolvedGeometry = useMemo(() => geometry ?? makeSphereGeometry({
    uvw: true,
    width: 2,
    detail: [segments, segments * 2],
  }), [geometry, segments]);

  return gather(
    use(GeometryData, resolvedGeometry),
    ([mesh]: GPUGeometry[]) => {
      const {attributes: {positions, indices}} = mesh;

      // Get bounding box / ray transform
      const parent = useMatrixContext();
      const [matrix, inverse, ray, normal] = useOne(() => {
        if (!parent) return [mat4.create(), mat4.create(), mat3.create(), mat3.create()];

        const m = mat4.clone(parent);
        const i = mat4.clone(m);
        mat4.invert(i, i);

        const r = mat3.fromMat4(mat3.create(), parent);
        mat3.invert(r, r);

        const n = mat3.normalFromMat4(mat3.create(), parent);
        return [m, i, r, n];
      }, parent);

      const local3 = useOne(vec3.create);
      const origin3 = useOne(vec3.create);

      // Determine if camera near plane is inside (lazy)
      const isInside = useCallback((uniforms: Record<string, Ref<any>>) => {
        const {inverseViewMatrix, viewPosition, viewNearFar} = uniforms;
        const {current: iVM} = inverseViewMatrix;
        const {current: viewP} = viewPosition;
        const {current: viewNF} = viewNearFar;

        // Offset along view-Z to near plane
        const offset = vec3.fromValues(iVM[8], iVM[9], iVM[10]);
        vec3.normalize(offset, offset);
        vec3.scale(offset, offset, -viewNF[0]);

        // Relative to camera
        vec3.add(local3, viewP, offset);

        // Relative to object
        vec3.transformMat4(local3, local3, inverse);
        vec3.sub(local3, local3, center as vec3);

        return vec3.length(local3) < radius;
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [inverse, local3, radius]);

      // Transform view position into object space to use as starting point inside (lazy)
      const getOrigin = useCallback((uniforms: Record<string, Ref<any>>) => {
        const {viewPosition} = uniforms;
        const {current: viewP} = viewPosition;
        vec3.copy(origin3, viewP);
        vec3.transformMat4(origin3, origin3, inverse);

        return origin3;
      }, [inverse, origin3]);

      const boundPosition = useShader(getImpostorVertex, [positions, c, s]);
      const getPosition = useLambdaSource(boundPosition, positions);

      const insideRef = useShaderRef(0);
      const originRef = useShaderRef(ORIGIN) as Ref<number[] | vec3>;

      const getEmissive = emissive ? useShader(getSphereImpostorEmissive, [
        matrix, ray, normal, center, size, insideRef, originRef, trace,
      ]) : useNoShader();

      const getSurface = !emissive ? useShader(getSphereImpostorSurface, [
        matrix, ray, normal, center, size, insideRef, originRef, trace,
      ]) : useNoShader();

      const getDepth = getSurface ? bindEntryPoint(getSurface, 'getSphereImpostorDepth') : null;

      const environmentMap = !emissive ? useEnvironmentContext() : (useNoEnvironmentContext(), null);
      const getEnvironment = environmentMap
        ? useShader(applyPBREnvironment, [environmentMap])
        : useNoShader();

      const render = (
        use(Primitive, { children:
          use(emissive ? ShaderFlatMaterial : ShaderLitMaterial, {
            fragment: getEmissive,
            depth: getDepth,
            surface: getSurface,
            apply: applyPBRMaterial,
            environment: getEnvironment,
            children: [
            
              // Debug layer
              debug ? use(FaceLayer, {
                positions: getPosition,
                indices: indices,
                uvs: getPosition,
                fragDepth: true,
                mode: 'debug',
              }) : null,
              
              // Outside layer
              use(FaceLayer, {
                positions: getPosition,
                indices: indices,
                uvs: getPosition,
                fragDepth: !emissive,
                shadow: !emissive,
                shaded: !emissive,
                blend,
                mode,
                alphaToCoverage: !emissive,
                shouldDispatch: inside ? (uniforms: Record<string, Ref<any>>) => {
                  insideRef.current = +isInside(uniforms);
                  return !insideRef.current;
                } : undefined,
              }),
              
              // Inside layer
              inside ? use(FaceLayer, {
                positions: getPosition,
                indices: indices,
                uvs: getPosition,
                fragDepth: !emissive,
                shadow: !emissive,
                shaded: !emissive,
                side: 'back',
                blend,
                mode,
                alphaToCoverage: !emissive,
                shouldDispatch: (uniforms: Record<string, Ref<any>>) => {
                  insideRef.current = +isInside(uniforms);
                  originRef.current = getOrigin(uniforms);
                  return !!insideRef.current;
                },
              }) : null,
            ],
          }),
        })
      );

      return render;
    }
  );
}, 'SphereImpostor');
