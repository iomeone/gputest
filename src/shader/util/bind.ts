import { ParsedBundle, ParsedModule, ShaderModule, ShaderDefine, DataBinding } from '../types';

import { parseLinkAliases } from '../util/link';
import { getHash, makeKey } from '../util/hash';
import { toBundle, toModule, getBundleHash } from '../util/bundle';
import { loadStaticModule } from '../util/shader';
import { PREFIX_CLOSURE, PREFIX_VIRTUAL, VIRTUAL_BINDINGS } from '../constants';

import { timed } from './timed';

const NO_SYMBOLS = [] as any[];
3
export type BindBundle2 = (
  bundle: ShaderModule,
  links?: Record<string, ShaderModule>,
  defines?: Record<string, ShaderDefine> | null,
  key?: string | number,
) => string;

export type BindBundle = (
  bundle: ShaderModule,
  linkDefs?: Record<string, ShaderModule>,
  defines?: Record<string, ShaderDefine> | null,
  key?: string | number,
) => string;

export type BindModule = (
  main: ParsedModule,
  libs?: Record<string, ShaderModule>,
  linkDefs?: Record<string, ShaderModule>,
  defines?: Record<string, ShaderDefine> | null,
  virtual?: ParsedModule[],
  key?: string | number,
) => ParsedBundle;

export type DefineConstants = (
  defines: Record<string, ShaderDefine>
) => string;

export type MakeUniformBlock = (
  constants: DataBinding[],
  set?: number | string,
  binding?: number | string,
) => string;

export const bindBundle = (
  subject: ShaderModule,
  links: Record<string, ShaderModule> | null = null,
  defines: Record<string, ShaderDefine> | null = null,
  key: string | number = makeKey(),
): ParsedBundle => {
  const bundle = toBundle(subject);
  if (!links && !defines) return bundle;

  const hash = getBundleHash(bundle);
  const external: string[] = [];
  for (const k in links) if (links[k]) external.push(getBundleHash(links[k]));

  const unique = `@closure [${hash}] [${external.join(' ')}]`;
  const rehash = getHash(unique);
  const rekey  = getHash(`${rehash} ${key.toString(16)}`);
  
  const relinks = bundle.links ? {
    ...bundle.links,
    ...links,
  } : links ?? undefined;

  const redefines = defines && bundle.defines ? {
    ...bundle.defines,
    ...defines,
  } : defines ?? bundle.defines ?? undefined;

  const revirtuals = bundle.virtuals ? bundle.virtuals.slice() : [];
  if (links) for (const k in links) if (links[k]) {
    const chunk = links[k] as any;

    // Copy bundle's sub-virtuals
    if (chunk.virtuals) revirtuals.push(...chunk.virtuals);

    // Add virtual module to list
    if (chunk.virtual) revirtuals.push(chunk);
    if (chunk.module?.virtual) revirtuals.push(chunk.module);
  }

  return {
    ...bundle,
    links: relinks,
    defines: redefines,
    hash: rehash,
    key: rekey,
    virtuals: revirtuals,
  };
};

export const bindModule = bindBundle;

export const makeResolveBindings = (
  makeUniformBlock: MakeUniformBlock,
  getVirtualBindGroup: (defines?: Record<string, ShaderDefine>) => string | number,
) => timed('resolveBindings', (
  modules: ParsedBundle[],
  defines?: Record<string, ShaderDefine>,
): {
  modules: ParsedBundle[],
  uniforms: DataBinding[],
  bindings: DataBinding[],
} => {
  const allUniforms = [] as DataBinding[];
  const allBindings = [] as DataBinding[];

  const seen = new Set<ParsedModule>();

  // Gather all namespaced uniforms and bindings from all virtual modules.
  // Assign base offset to each virtual module in-place.
  let base = 0;
  let index = 0;
  for (const {virtuals} of modules) {
    if (virtuals) for (const m of virtuals) {
      if (seen.has(m)) continue;
      seen.add(m);

      if (m.virtual) {
        const {uniforms, storages, textures} = m.virtual;
        const namespace = `${PREFIX_VIRTUAL}${++index}_`;
        if (uniforms) for (const u of uniforms) allUniforms.push(namespaceBinding(namespace, u));
        if (storages) for (const b of storages) allBindings.push(b);
        if (textures) for (const b of textures) allBindings.push(b);

        // Mutate virtual modules as they are ephemeral
        m.virtual.namespace = namespace;
        m.virtual.base = base;
        if (storages) base += storages.length;
        if (textures) base += textures.length * 2;
      }
    };
  }

  // Create combined uniform block as top-level import
  const virtualBindGroup = getVirtualBindGroup(defines);
  const code = makeUniformBlock(allUniforms, virtualBindGroup, base);
  const lib = loadStaticModule(code, VIRTUAL_BINDINGS);

  const imported = {at: -1, symbols: NO_SYMBOLS, name: VIRTUAL_BINDINGS, imports: NO_SYMBOLS};

  // Append to modules
  const out = modules.map((m: ShaderModule) => {
    const bundle = toBundle(m);

    const {module, libs} = bundle;
    const {table} = module;
    const {modules} = table;

    const retable = {
      ...table,
      modules: modules ? [...modules, imported] : [imported],
    };

    return {
      ...bundle,
      module: {
        ...module,
        table: retable,
      },
      libs: {
        ...libs,
        [VIRTUAL_BINDINGS]: lib,
      },
    };
  });

  return {
    modules: out,
    uniforms: allUniforms,
    bindings: allBindings,
  };
});

export const namespaceBinding = (namespace: string, binding: DataBinding) => {
  const {uniform} = binding;
  const {name} = uniform;
  const imp = namespace + name;
  return {...binding, uniform: {...uniform, name: imp}};
};

const VIRTUAL = 'VIRTUAL';

export const getBindingArgument = (binding?: ShaderDefine): string | number => {
  if (typeof binding === 'string') {
    const a = binding.indexOf('(');
    const b = binding.indexOf(')');
    return binding.slice(a + 1, b);
  }
  if (typeof binding === 'number') return binding;
  return VIRTUAL;
}
