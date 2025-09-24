import { ShaderModule, ShaderDefine, DataBinding } from './types';

import { defineConstants } from './shader';
import { makeBindingAccessors, makeUniformBlock } from './gen';
import { makeBindModule, makeBindBundle, makeResolveBindings, namespaceBinding, getBindingArgument } from '../util/bind';
import { VIRTUAL_BINDGROUP } from './constants';

const NO_SYMBOLS = [] as any[];

const getVirtualBindGroup = (
  defines?: Record<string, ShaderDefine>
) => defines ? getBindingArgument(defines[VIRTUAL_BINDGROUP]) : "VIRTUAL";

export const bindingToModule = (
  binding: DataBinding,
): ShaderModule => {
  const {uniform: {name}} = binding;
  const links = makeBindingAccessors([binding]);
  const module = links[name];
  return {...module, entry: name};
}

export const bindingsToLinks = (
  bindings: DataBinding[],
): Record<string, ShaderModule> => {
  return makeBindingAccessors(bindings);
}

export const bindModule = makeBindModule(defineConstants);

export const bindBundle = makeBindBundle(bindModule);

export const resolveBindings = makeResolveBindings(makeUniformBlock, getVirtualBindGroup);
