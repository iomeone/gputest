import { UniformAttribute, ParsedBundle, ParsedModule, TypeLike, RefFlags as RF } from '../types';

const NO_LIBS = {};

export const getBundleKey = (bundle: ParsedBundle | ParsedModule) => {
  return (('module' in bundle) ? bundle.key ?? bundle.module.key : bundle.key) ?? getBundleHash(bundle);
};

export const getBundleHash = (bundle: ParsedBundle | ParsedModule) => {
  return ('module' in bundle) ? bundle.hash ?? bundle.module.hash : bundle.hash;
};

// Force module/bundle to bundle
export const toBundle = (bundle: ParsedBundle | ParsedModule): ParsedBundle => {
  if (typeof bundle === 'string') throw new Error("Bundle is a string instead of an object");

  if ('table' in bundle) return {
    module: bundle as ParsedModule,
  } as ParsedBundle;

  return bundle;
}

// Force module/bundle to module
export const toModule = (bundle: ParsedBundle | ParsedModule) => {
  if (typeof bundle === 'string') throw new Error("Bundle is a string instead of an object");

  if ('table' in bundle) return bundle as ParsedModule;
  return bundle.module;
}

// Parse escaped C-style string
export const parseString = (s: string) => s.slice(1, -1).replace(/\\(.)/g, '$1');

type ToTypeString = (t: TypeLike | string) => string;
type ToArgTypes = (t: (TypeLike | string)[]) => string[];

// Convert bundle to attributes for its external declarations
export const makeBundleToAttributes = (
  toTypeString: ToTypeString,
  toArgTypes: ToArgTypes,
) => (
  bundle: ParsedBundle | ParsedModule,
): UniformAttribute[] => {
  const module = toModule(bundle);
  const {table: {declarations}} = module;

  const out: UniformAttribute[] = [];
  for (const fn of declarations) if (fn.func) {
    const {func, flags} = fn;
    if (flags & RF.External) {
      const {type, name, parameters} = func;
      out.push({name, format: toTypeString(type), args: toArgTypes(parameters)});
    }
  }

  return out;
}

// Convert bundle to attribute for entry point (or named declaration)
export const makeBundleToAttribute = (
  toTypeString: ToTypeString,
  toArgTypes: ToArgTypes,
) => (
  bundle: ParsedBundle | ParsedModule,
  name?: string,
): UniformAttribute => {
  const module = toModule(bundle);
  const {table: {declarations}} = module;

  const entry = name ?? bundle.entry ?? module.entry;

  for (const fn of declarations) if (fn.func) {
    const {func} = fn;
    const {type, name, parameters} = func;
    if (name === entry) {
      return {name, format: toTypeString(type), args: toArgTypes(parameters)};
    }
  }

  return {name: name ?? 'main', format: 'void', args: []};
}
