import { UniformAttribute, ShaderModule, ParsedBundle, ParsedModule, TypeLike, FormatLike, ParameterLike, BundleSummary } from '../types';

export const getBundleKey = (bundle: ShaderModule): number => {
  return (('module' in bundle) ? bundle.key ?? bundle.module.key : bundle.key) ?? getBundleHash(bundle);
};

export const getBundleHash = (bundle: ShaderModule): number => {
  return ('module' in bundle) ? bundle.hash ?? bundle.module.hash : bundle.hash;
};

export const getBundleEntry = (bundle: ShaderModule) => {
  return ('module' in bundle) ? bundle.entry ?? bundle.module.entry : bundle.entry;
};

export const getBundleName = (bundle: ShaderModule) => {
  return ('module' in bundle) ? bundle.module.label ?? bundle.module.name : bundle.label ?? bundle.entry;
};

export const getBundleLabel = (bundle: ShaderModule) => {
  const {name, links, libs} = getBundleSummary(bundle, 10);

  const imports: string[] = [
    ...links.map(formatSummary),
    ...libs.map(formatSummary),
  ];
  return `${name}\n\n${name}\n${imports.join("\n")}`;
}

// Force module/bundle to bundle
export const toBundle = (bundle: ShaderModule): ParsedBundle => {
  if (bundle === undefined) throw new Error("Bundle is undefined");
  if (bundle === null) throw new Error("Bundle is null");
  if (typeof bundle === 'string') throw new Error("Bundle is a string instead of an object");

  if ('table' in bundle) return {
    module: bundle as ParsedModule,
  } as ParsedBundle;

  return bundle;
}

// Force module/bundle to module
export const toModule = (bundle: ShaderModule) => {
  if (bundle === undefined) throw new Error("Bundle is undefined");
  if (bundle === null) throw new Error("Bundle is null");
  if (typeof bundle === 'string') throw new Error("Bundle is a string instead of an object");

  if ('table' in bundle) return bundle as ParsedModule;
  return bundle.module;
}

// Parse escaped C-style string
export const parseString = (s: string) => s.slice(1, -1).replace(/\\(.)/g, '$1');

type ToTypeSymbol = (t: TypeLike) => FormatLike<any>;
type ToArgTypes = (t: ParameterLike[]) => string[];

export const makeDeclarationToAttribute = (
  toTypeSymbol: ToTypeSymbol,
  toArgTypes: ToArgTypes,
) => (
  bundle: ParsedBundle,
  d: any,
) => {
  if (d.format) return d;
  if (d.func) {
    const {type, name, parameters, attr} = d.func;
    const resolved = resolveTypeSymbol(bundle, toTypeSymbol(type));
    return {name, ...resolved, args: toArgTypes(parameters), attr};
  }
  if (d.variable || d.constant) {
    const {type, name, attr} = d.variable ?? d.constant;
    const resolved = resolveTypeSymbol(bundle, toTypeSymbol(type));
    return {name, ...resolved, args: null, attr};
  }
  if (d.struct) {
    const {name, members, attr} = d.struct;
    const ms = members?.map(({name, type}: any) => ({
      name,
      ...resolveTypeSymbol(bundle, toTypeSymbol(type)),
    }));
    return {name, format: ms, args: null, attr};
  }
  throw new Error(`Cannot convert declaration to attribute: ${JSON.stringify(d)}`);
}

// Convert custom type names to their originating bundle (if foreign)
const resolveTypeSymbol = (bundle: ParsedBundle, f: FormatLike<string>): FormatLike<ShaderModule> => {
  const {libs, module} = bundle;
  const {format, type: typeName} = f;

  if (typeName != null && libs) {
    const {table: {modules}} = module;
    if (modules) for (const {name: lib, imports} of modules) {
      for (const {name, imported} of imports) {
        if (name === typeName) {
          const m = libs[lib];
          if (m) return {format, type: {...m, entry: imported}};
        }
      }
    }

    // Must be local
    return {format: typeName};
  }

  return {format};
}

// Convert bundle to attributes for its external declarations
export const makeBundleToAttributes = (
  toTypeSymbol: ToTypeSymbol,
  toArgTypes: ToArgTypes,
) => {
  const toAttribute = makeDeclarationToAttribute(toTypeSymbol, toArgTypes);

  return (
    shader: ShaderModule,
  ): UniformAttribute[] => {
    const bundle = toBundle(shader);
    const {module: {table: {externals}}} = bundle;

    const out: UniformAttribute[] = [];
    for (const d of externals) if (d.func ?? d.variable ?? d.constant) {
      const attr = toAttribute(bundle, d);
      if (!bundle.links?.[attr.name]) out.push(attr);
    }

    return out;
  };
};

// Convert bundle to attribute for entry point (or named declaration)
export const makeBundleToAttribute = (
  toTypeSymbol: ToTypeSymbol,
  toArgTypes: ToArgTypes,
) => {
  const toAttribute = makeDeclarationToAttribute(toTypeSymbol, toArgTypes);

  return (
    shader: ShaderModule,
    name?: string,
  ): UniformAttribute => {
    const bundle = toBundle(shader);
    const {module: {table: {externals, exports}}} = bundle;

    const entry = name ?? getBundleEntry(bundle);

    // Externals must be looked up by name
    if (name != null) for (const d of externals) {
      if (
        d.func?.name === entry ||
        d.variable?.name === entry ||
        d.constant?.name === entry ||
        d.struct?.name === entry
      ) {
        return toAttribute(bundle, d);
      }
    }

    // Exports are looked up by entry point
    for (const d of exports) {
      if (
        d.func?.name === entry ||
        d.variable?.name === entry ||
        d.constant?.name === entry ||
        d.struct?.name === entry
      ) {
        return toAttribute(bundle, d);
      }
    }

    throw new Error(`Unknown attribute ${entry}`);
  };
};

// Shader module printing for debug/info
export const getBundleSummary = (bundle: ShaderModule, maxDepth: number = Infinity) => {
  const allLinks: Partial<BundleSummary>[] = [];
  const allLibs: Partial<BundleSummary>[] = [];

  const libMap = new Map<number, Partial<BundleSummary>>();

  const recurse = (
    bundle: ShaderModule,
    out: Partial<BundleSummary>,
    key: string,
    depth: number = 0,
  ) => {
    const {libs, links} = bundle as ParsedBundle;

    out.name  = (
      getBundleName(bundle) ??
      getBundleEntry(bundle) ??
      'Unknown module'
    );
    out.key   = getBundleKey(bundle);
    out.hash  = getBundleHash(bundle);
    out.depth = out.link ? depth : 0;

    if (out.lib?.match(/^_VT_/)) out.lib = out.name;

    if (depth < maxDepth) {
      for (const k in libs) if (libs[k]) {
        const key = getBundleKey(libs[k]);
        if (libMap.has(key)) continue;

        const sub = {lib: k};
        allLibs.push(sub);
        libMap.set(key, sub);

        recurse(libs[k], sub, k, depth + 1);
      }

      for (const k in links) if (links[k]) {
        const key = getBundleKey(links[k]);
        if (libMap.has(key)) continue;

        const sub = {link: k};
        allLinks.push(sub);
        libMap.set(key, sub);

        recurse(links[k], sub, k, depth + 1);
      }
    }
  };

  recurse(bundle, {}, 'main', 0);

  return {
    name: getBundleName(bundle),
    links: allLinks as BundleSummary[],
    libs: allLibs as BundleSummary[]
  };
};

const SPACE = '  ';
export const formatSummary = (summary: BundleSummary) => {
  const {lib, link, name, depth} = summary;
  const indent = SPACE.repeat(depth);
  return `${indent}${lib ? lib : `${link}: ${name}`}`;
};

