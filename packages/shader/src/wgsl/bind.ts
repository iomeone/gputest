import { ShaderModule, ShaderDefine, LambdaSource, StorageSource, TextureSource, DataBinding } from './types';

import { toModule } from '../util/bundle';
import { makeBindingAccessors, makeUniformBlock } from './gen';
import { makeResolveBindings, getBindingArgument } from '../util/bind';
import { VIRTUAL_BINDGROUP } from './constants';

export { bindBundle, bindModule } from '../util/bind';

const getVirtualBindGroup = (
  defines?: Record<string, ShaderDefine>
) => defines ? getBindingArgument(defines[VIRTUAL_BINDGROUP]) : "VIRTUAL";

export const bindingToModule = (
  binding: DataBinding,
): ShaderModule => {
  const {attribute: {name}, lambda} = binding;
  const links = makeBindingAccessors([binding]);
  const module = links[name];
  return {...module, entry: !lambda ? name : undefined };
}

export const bindingsToLinks = (
  bindings: DataBinding[],
): Record<string, ShaderModule> => {
  return makeBindingAccessors(bindings);
}

export const sourceToModule = <T>(
  source: ShaderModule | LambdaSource<T> | StorageSource | TextureSource | any,
): ShaderModule | null => {
  if (source == null) return null;

  const s = source as any;
  if (s.shader) return s.shader as ShaderModule;
  else if (s.module || s.table) return source as ShaderModule;
  return null;
}

export const resolveBindings = makeResolveBindings(makeUniformBlock, getVirtualBindGroup);

const BINDING_SAMPLE_TYPES = {
  f: 'float',
  u: 'uint',
  i: 'sint',
} as Record<string, GPUTextureSampleType>;

