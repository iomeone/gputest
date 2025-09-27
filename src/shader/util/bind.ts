import { ParsedBundle, ParsedModule, ShaderModule, ShaderDefine, DataBinding } from '../types';

import { parseLinkAliases } from '../util/link';
import { toHash, formatMurmur53, toMurmur53, scrambleBits53, mixBits53 } from '../util/hash';
import { toBundle, toModule, getBundleHash, getBundleKey } from '../util/bundle';
import { loadStaticModule } from '../util/shader';
import { PREFIX_CLOSURE, PREFIX_VIRTUAL, VIRTUAL_BINDINGS } from '../constants';

import { timed } from './timed';

const NO_SYMBOLS = [] as any[];
const DEBUG = false;

export type BindBundle2 = (
  bundle: ShaderModule,
  links?: Record<string, ShaderModule | null>,
  defines?: Record<string, ShaderDefine> | null,
  key?: string | number,
) => string;

export type BindBundle = (
  bundle: ShaderModule,
  linkDefs?: Record<string, ShaderModule | null>,
  defines?: Record<string, ShaderDefine> | null,
  key?: string | number,
) => string;

export type BindModule = (
  main: ParsedModule,
  libs?: Record<string, ShaderModule>,
  linkDefs?: Record<string, ShaderModule | null>,
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
  links: Record<string, ShaderModule | null> | null = null,
  defines: Record<string, ShaderDefine> | null = null,
): ParsedBundle => {
  const bundle = toBundle(subject);
  if (!links && !defines) return bundle;

  const hash = getBundleHash(bundle);
  const key = getBundleKey(bundle);

  let external: number = 0;
  for (const k in links) if (links[k]) external = mixBits53(external, getBundleHash(links[k]!));

  const defs = defines ? toMurmur53(defines) : '';
  const code = `@closure`;
  const rehash = scrambleBits53(mixBits53(hash, mixBits53(external, toMurmur53(defs))));

  external = 0;
  for (const k in links) if (links[k]) external = mixBits53(external, getBundleKey(links[k]!));
  const rekey = scrambleBits53(mixBits53(key, external));

  const relinks = bundle.links ? {
    ...bundle.links,
  } : {} ?? undefined;

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

    relinks[k] = links[k]!;
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
  lazy?: boolean,
): {
  modules: ParsedBundle[],
  uniforms: DataBinding[],
  bindings: DataBinding[],
  volatiles: DataBinding[],
} => {
  const allUniforms  = [] as DataBinding[];
  const allBindings  = [] as DataBinding[];
  const allVolatiles = [] as DataBinding[];

  const seen = new Set<number>();
  DEBUG && console.log('------------')

  const addBinding = (b: DataBinding, slots: number) => {
    const s = (b.storage ?? b.texture) as any;
    if (s && s.volatile) {
      allVolatiles.push(b);
      volatileBase += slots;
    }
    else {
      allBindings.push(b);
      bindingBase += slots;
    }
  }

  // Gather all namespaced uniforms and bindings from all virtual modules.
  // Assign base offset to each virtual module in-place.
  let bindingBase = 0;
  let volatileBase = 0;
  let index = 0;
  for (const {virtuals} of modules) {
    if (virtuals) for (const m of virtuals) {
      const key = getBundleKey(m);

      if (seen.has(key)) continue;
      seen.add(key);

      DEBUG && console.log('virtual', m.code, m.hash, m.key);

      if (m.virtual) {
        const {uniforms, storages, textures} = m.virtual;

        // Mutate virtual modules as they are ephemeral
        const namespace = `${PREFIX_VIRTUAL}${++index}_`;
        if (!lazy) {
          m.virtual.namespace = namespace;
          m.virtual.bindingBase = bindingBase;
          m.virtual.volatileBase = volatileBase;
        }

        if (uniforms) for (const u of uniforms) allUniforms.push(namespaceBinding(namespace, u));
        if (storages) for (const b of storages) addBinding(b, 1);
        if (textures) for (const b of textures) addBinding(b, 1 + +!!b.texture!.sampler);
      }
    };
  }

  let out = modules;

  // Create combined uniform block as top-level import
  if (!lazy) {
    const virtualBindGroup = getVirtualBindGroup(defines);
    const code = makeUniformBlock(allUniforms, virtualBindGroup, bindingBase);
    const lib = loadStaticModule(code, VIRTUAL_BINDINGS);

    const imported = {at: -1, symbols: NO_SYMBOLS, name: VIRTUAL_BINDINGS, imports: NO_SYMBOLS};

    // Append to modules
    out = modules.map((m: ShaderModule) => {
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
  }

  return {
    modules: out,
    uniforms: allUniforms,
    bindings: allBindings,
    volatiles: allVolatiles,
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
