import { useMemo } from '@use-gpu/live';
import { useMatrixContext, useViewContext, usePerFrame } from '@use-gpu/workbench';
import { mat4, vec3, vec4 } from 'gl-matrix';

type GizmoMatrixOptions = {
  matrix: mat4,
  size: number,
  flip: boolean | boolean[],
};

// Flip orientation relative to view + maintain absolute on-screen scale
export const useGizmoMatrix = (opts: GizmoMatrixOptions) => {
  const {matrix, size, flip = false} = opts;
  
  const {uniforms} = useViewContext();
  const frameCount = usePerFrame();

  const parent = useMatrixContext();
  return useMemo(() => {
    const pvm = uniforms.projectionViewMatrix.current;

    // Distance of gizmo to view (for absolute size)
    const p = vec4.fromValues(0, 0, 0, 1);
    vec4.transformMat4(p, p, matrix);
    if (parent) vec4.transformMat4(p, p, parent);
    vec4.transformMat4(p, p, pvm);

    const vz = p[3];
    const s = size * vz;

    // Orientation flipping relative to view
    const v = vec3.clone(uniforms.viewPosition.current as vec3);
    const i = mat4.create();

    const xform = parent ? mat4.multiply(mat4.create(), parent, matrix) : matrix;
    mat4.invert(i, xform);
    vec3.transformMat4(v, v, i);

    const sign = (x: number) => x ? Math.sign(x) : 1;

    const flipX = Array.isArray(flip) ? flip[0] : flip;
    const flipY = Array.isArray(flip) ? flip[1] : flip;
    const flipZ = Array.isArray(flip) ? flip[2] : flip;

    const x = (flipX ? sign(v[0]) : 1) * s;
    const y = (flipY ? sign(v[1]) : 1) * s;
    const z = (flipZ ? sign(v[2]) : 1) * s;

    const flipped = mat4.fromScaling(mat4.create(), [x, y, z]);
    const local = mat4.multiply(mat4.create(), matrix, flipped);

    return [local, xform];
    // eslint-disable-next-line
  }, [uniforms, frameCount, parent, matrix, size]);
};
