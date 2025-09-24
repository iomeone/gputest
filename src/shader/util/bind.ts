import { ParsedBundle, ParsedModule, ShaderModule, ShaderDefine, DataBinding } from '../types';

import { parseLinkAliases } from '../util/link';
import { getProgramHash, makeKey } from '../util/hash';
import { toBundle } from '../util/bundle';
import { loadStaticModule } from '../util/shader';
import { PREFIX_CLOSURE, PREFIX_VIRTUAL, VIRTUAL_BINDINGS } from '../constants';

import { timed } from './timed';

const NO_SYMBOLS = [] as any[];

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

export const makeBindBundle = (
  bindModule: BindModule,
) => timed('bindBundle', (
  bundle: ShaderModule,
  linkDefs: Record<string, ShaderModule> = {},
  defines?: Record<string, ShaderDefine> | null,
  key: string | number = makeKey(),
): ParsedBundle => {
  const {module, libs, virtual} = toBundle(bundle);
  return bindModule(module, libs, linkDefs, defines, virtual, key);
});

export const makeBindModule = (
  defineConstants: DefineConstants,
) => timed('bindModule', (
  main: ParsedModule,
  libs: Record<string, ShaderModule> = {},
  linkDefs: Record<string, ShaderModule> = {},
  defines?: Record<string, ShaderDefine> | null,
  virtual?: ParsedModule[],
  key: string | number = makeKey(),
): ParsedBundle => {
  const [links, aliases] = parseLinkAliases(linkDefs);

  const {name, table} = main;
  const {hash, modules, externals} = table;

  const rehash = getProgramHash(`#closure [${name}] ${hash} ${key.toString(16)}`);
  const namespace = `${PREFIX_CLOSURE}${rehash.slice(0, 6)}_`;

  const relinks: Record<string, ShaderModule> = {};
  const reexternals = [];
  const revirtual = virtual ? virtual.slice() : [];
  const reimports = modules?.slice() ?? [];

  if (defines && Object.keys(defines).length) {
    const def = defineConstants(defines) + "\n";
    reimports.push({at: -1, symbols: NO_SYMBOLS, name: namespace, imports: NO_SYMBOLS});
    relinks[namespace] = loadStaticModule(def, 'def');
  }

  if (externals) for (const external of externals) if (external.func) {
    const {flags, func} = external;
    const {name} = func;

    if (links[name]) {
      const link = links[name] as any;
      const entry = link.entry ?? link.module?.entry;
      const resolved = entry ?? aliases?.get(name) ?? name;

      const imp = namespace + name;
      relinks[imp] = {...links[name], entry: resolved};
      reimports.push({at: 0, symbols: NO_SYMBOLS, name: imp, imports: [{name, imported: resolved}]});

      // Collect virtual modules from links for resolving later
      if ('name' in link) {
        const {virtual} = link;
        if (virtual) revirtual.push(link);
      }
      else {
        const {virtual} = link;
        if (virtual) for (const v of virtual) revirtual.push(v);
        if (link.module.virtual) revirtual.push(link.module);
      }
    }
    else {
      reexternals.push(external);
    }
  }

  const retable = {
    ...table,
    hash: rehash,
    modules: reimports,
    externals: reexternals,
  };

  return {
    module: {
      ...main,
      table: retable,
    },
    libs: {...libs, ...relinks},
    virtual: revirtual.length ? revirtual : undefined,
  };
});

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
  for (const {virtual} of modules) {
    if (virtual) for (const m of virtual) {
      if (seen.has(m)) continue;
      seen.add(m);

      if (m.virtual) {
        const {uniforms, storages, textures} = m.virtual;
        const namespace = `${PREFIX_VIRTUAL}${base}_`;
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
    const {module, libs} = toBundle(m);
    const {table} = module;
    const {modules} = table;

    const retable = {
      ...table,
      modules: modules ? [...modules, imported] : [imported],
    };

    return {
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

export const getBindingArgument = (binding?: ShaderDefine): string | number =>
  typeof binding === 'string' ? binding.split(/[()]/)[1] :
  typeof binding === 'number' ? binding : 'VIRTUAL';
