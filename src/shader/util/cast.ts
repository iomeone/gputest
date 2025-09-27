import { ShaderModule, ParsedBundle, UniformAttribute } from '../types';
import { loadVirtualModule } from './shader';
import { getHash } from './hash';
import { toBundle, getBundleHash, getBundleKey } from './bundle';
import { PREFIX_CAST } from '../constants';

const NO_SYMBOLS = [] as string[];

export type CastTo = {
  basis: string,
  signs?: string,
  gain?: number,
};

export type BundleToAttribute = (
  bundle: ShaderModule,
) => UniformAttribute;

export type MakeCastAccessor = (
  name: string,
  accessor: string,
  args: string[],
  from: string,
  to: string,
  swizzle: string | CastTo,
) => string;

const EXTERNALS = [{
  func: {name: 'getValue'},
  flags: 0,
}];

export const makeCastTo = (
  makeCastAccessor: MakeCastAccessor,
  bundleToAttribute: BundleToAttribute,
) => (
  source: ShaderModule,
  type: string,
  swizzle: string | CastTo,
): ParsedBundle => {
  const bundle = toBundle(source);

  const {module, virtuals} = bundle;
  const {name, format, args} = bundleToAttribute(bundle);

  const entry = 'cast';

  const hash = getBundleHash(bundle);
  const key  = getBundleKey(bundle);

  const code   = `@cast [${name} ${format}] [${hash}]`;
  const rehash = getHash(code);
  const rekey  = getHash(`${code} ${key}`);

  const symbols = [entry, 'getValue'];

  // Code generator
  const render = (namespace: string, rename: Map<string, string>) => {
    const name = rename.get(entry) ?? entry;
    const accessor = rename.get('getValue') ?? 'getValue';
    return makeCastAccessor(name, accessor, args ?? [], format, type, swizzle);
  }

  const cast = loadVirtualModule(
    { render },
    { symbols, externals: EXTERNALS },
    entry,
    rehash,
    code,
    rekey,
  );

  const revirtuals = module.virtual
    ? (virtuals ? [...virtuals, module] : [module])
    : virtuals;

  return {module: cast, links: {getValue: bundle}, virtuals: revirtuals};
}

export const parseSwizzle = (swizzle: string | CastTo) => {
  let c: CastTo;
  if (typeof swizzle === 'string') c = {basis: swizzle};
  else c = swizzle as CastTo;

  let {basis} = c;
  while (basis.length < 4) basis = basis + '0';

  return c;
}
