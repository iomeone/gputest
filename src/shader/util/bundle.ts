import  { ParsedBundle, ParsedModule } from '../types';

const NO_LIBS = {};

// Accept direct module or bundle, with entry point on either.
export const toBundle = (bundle: ParsedBundle | ParsedModule): ParsedBundle => {
  if (typeof bundle === 'string') throw new Error("Bundle is a string instead of an object");

  if ('name' in bundle) return {
    module: bundle as ParsedModule,
    libs: NO_LIBS,
  } as ParsedBundle;

  let {module, libs, virtual, entry} = bundle;
  if (entry != null) {
    module = {...module, entry};
    return {module, libs, virtual} as ParsedBundle;
  }
  return bundle;
}

// Accept direct module or bundle, with entry point on either.
export const toModule = (bundle: ParsedBundle | ParsedModule) => {
  if (typeof bundle === 'string') throw new Error("Bundle is a string instead of an object");

  if ('name' in bundle) return bundle as ParsedModule;

  let {module, entry} = bundle;
  if (entry != null) {
    return {...module, entry} as ParsedModule;
  }
  return module;
}

// Parse bundle of imports into main + libs
export const parseBundle = (bundle: ParsedBundle | ParsedModule): [ParsedModule, Record<string, ParsedModule>, ParsedModule[]] => {
  let {module, libs, virtual} = toBundle(bundle);

  const out = {} as Record<string, ParsedModule>;
  const traverse = (libs: Record<string, ParsedBundle | ParsedModule>) => {
    for (let k in libs) {
      const {module, libs: subs} = toBundle(libs[k]);
      out[k] = module;
      if (subs) traverse(subs);
    }
  };
  if (libs) traverse(libs);

  return [module, out, virtual ?? []];
}

// Visit every module in a bundle
export const forBundleModules = (
  bundle: ParsedBundle | ParsedModule,
  callback: (m: ParsedModule) => void,
) => {
  const traverse = (lib: ParsedBundle | ParsedModule) => {
    if ('name' in lib) {
      callback(lib);
      return;
    }

    let {module, libs} = lib;
    callback(module);

    if (libs) for (let k in libs) traverse(libs[k]);
  }

  traverse(bundle);
}

// Parse escaped C-style string
export const parseString = (s: string) => s.slice(1, -1).replace(/\\(.)/g, '$1');

// Parse run-time specified keys `from:to` into a map of aliases
export const parseLinkAliases = <T>(
  links: Record<string, T>,
): [
  Record<string, T>,
  Map<string, string> | null,
] => {
  const out = {} as Record<string, T>;
  let aliases = null as Map<string, string> | null;

  for (let k in links) {
    const link = links[k] as any;
    if (!link) continue;

    let [name, imported] = k.split(':');
    if (!imported && link.entry != null) imported = link.entry;
    if (!imported && link.module?.entry != null) imported = link.module.entry;

    out[name] = link;
    if (imported) {
      if (!aliases) aliases = new Map<string, string>();
      aliases.set(name, imported);
    }
  }

  return [out, aliases];
}
