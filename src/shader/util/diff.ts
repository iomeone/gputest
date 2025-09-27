import { UniformAttribute, ShaderModule, ParsedBundle } from '../types';
import { loadVirtualModule } from './shader';
import { getHash } from './hash';
import { toBundle, getBundleHash, getBundleKey } from './bundle';
import { PREFIX_CAST } from '../constants';

const NO_SYMBOLS = [] as string[];

export type BundleToAttribute = (
  bundle: ShaderModule,
) => UniformAttribute;

export type MakeDiffAccessor = (
  name: string,
  accessor: string,
  args: string[],
  type: string,
  offsets: (number | string)[],
) => string;

const EXTERNALS = [{
  func: {name: 'getValue'},
  flags: 0,
}];

export const makeDiffBy = (
  makeDiffAccessor: MakeDiffAccessor,
  bundleToAttribute: BundleToAttribute,
) => (
  source: ShaderModule,
  offset: number | string | (number | string)[],
): ParsedBundle => {
  const bundle = toBundle(source);

  const {module, virtuals} = bundle;
  const {name, format, args} = bundleToAttribute(bundle);

  const entry = 'diff';

  const hash = getBundleHash(bundle);
  const key  = getBundleKey(bundle);

  const code   = `@diff [${offset}] [${hash}]`;
  const rehash = getHash(code);
  const rekey  = getHash(`${code} ${key}`);

  const symbols = [entry, 'getValue'];
  const offsets = Array.isArray(offset) ? offset : [offset];

  // Code generator
  const render = (namespace: string, rename: Map<string, string>) => {
    const name = rename.get(entry) ?? 'entry';
    const accessor = rename.get('getValue') ?? 'getValue';
    return makeDiffAccessor(name, accessor, args ?? [], format, offsets);
  }

  const diff = loadVirtualModule(
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

  return {module: diff, links: {getValue: bundle}, virtuals: revirtuals};
}
