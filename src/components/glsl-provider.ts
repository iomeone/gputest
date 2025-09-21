import { LiveComponent, LiveElement } from '../live/types';

import { memo, provide, makeContext, useOne } from '../live';
import { ViewUniforms, UniformAttribute } from '../core/types';
import { VIEW_UNIFORMS, makeProjectionMatrix, makeOrbitMatrix } from '../core';

export const GLSLContext = makeContext(null, 'GLSLContext');

export type GLSLProviderProps = {
  compileGLSL: (s: string, t: string) => string,
  children: LiveElement<any>,
};

export const GLSLProvider: LiveComponent<GLSLProviderProps> = memo((fiber) => (props) => {
  const {compileGLSL, children} = props;
  const value = useOne(() => ({compileGLSL}), compileGLSL);
  return provide(GLSLContext, value, children);
}, 'GLSLProvider');