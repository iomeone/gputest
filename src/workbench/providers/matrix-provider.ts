import { makeContext, useContext, useNoContext } from '@use-gpu/live';
import { mat4 } from 'gl-matrix';

export type MatrixContextProps = mat4;

export const MatrixContext = makeContext<MatrixContextProps>(null, 'MatrixContext');

export const useMatrixContext = () => useContext(MatrixContext);
export const useNoMatrixContext = () => useNoContext(MatrixContext);
