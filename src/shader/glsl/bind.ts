import { ShaderModule, DataBinding } from './types';

import { defineConstants } from './shader';
import { makeBindingAccessors, makeUniformBlock } from './gen';
import { makeResolveBindings, namespaceBinding } from '../util/bind';
import { VIRTUAL_BINDGROUP } from './constants';

export { bindBundle, bindModule } from '../util/bind';

const NO_SYMBOLS = [] as any[];

const getVirtualBindGroup = () => VIRTUAL_BINDGROUP;

export const bindingToModule = (
  binding: DataBinding,
): ShaderModule => {
  const {uniform: {name}} = binding;
  const links = makeBindingAccessors([binding], VIRTUAL_BINDGROUP);
  const module = links[name];
  return {...module, entry: name};
}

export const bindingsToLinks = (
  bindings: DataBinding[],
): Record<string, ShaderModule> => {
  return makeBindingAccessors(bindings, VIRTUAL_BINDGROUP);
}

export const resolveBindings = makeResolveBindings(makeUniformBlock, getVirtualBindGroup);
