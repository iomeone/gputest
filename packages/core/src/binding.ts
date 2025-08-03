import { UniformAttribute, ResolvedDataBindings, ShaderLib } from './types';
import { makeStorageAccessors, checkStorageTypes, checkStorageType } from './storage';
import { makeUniformBlockAccessor } from './uniform';
import { makeShaderModule } from './pipeline';
import partition from 'lodash/partition';

export const extractPropBindings = (uniforms: UniformAttribute[], bindings: any[]): ResolvedDataBindings => {
  const constants = {} as Record<string, any>;
  const links = {} as Record<string, any>;
  for (const u of uniforms) {
    const v = bindings.shift();
    const b = bindings.shift();
    if (b != null) {
      checkStorageType(u, b);
      links[u.name] = b;
    }
    else if (v != null) {
      constants[u.name] = v;
    }
  }
  return {links, constants};
}


// Bind a shader to a set of data bindings, either as constants or a buffer
export const makeBoundStorageShader = (
  vertexShader: string,
  fragmentShader: string,
  uniforms: UniformAttribute[],
  dataBindings: ResolvedDataBindings,
  codeBindings: ShaderLib,
  defines: Record<string, string>,
  compile: (code: string, stage: string) => any,
  link: (code: string, modules: ShaderLib, accessors: ShaderLib, cache: any) => any,
  modules: ShaderLib,
  cache: any,
  base: number = 0,
) => {

  console.log("running: makeBoundStorageShader");
  const [attributes, constants] = partition(uniforms, ({name}) => !!(dataBindings.links as any)[name]);

  const constantAccessors = makeUniformBlockAccessor(constants, base);
  const storageAccessors = makeStorageAccessors(attributes, base, constants.length);
  const links = {...codeBindings, ...storageAccessors, ...constantAccessors};

  const vertexLinked = link(vertexShader, modules, links, defines, cache);
  const fragmentLinked = link(fragmentShader, modules, links, defines, cache);

  const vertex = makeShaderModule(compile(vertexLinked, 'vertex'));
  const fragment = makeShaderModule(compile(fragmentLinked, 'fragment'));

  return [vertex, fragment, attributes, constants];
};
