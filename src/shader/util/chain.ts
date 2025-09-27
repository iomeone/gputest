import { UniformAttribute, ShaderModule, ParsedBundle } from '../types';
import { loadVirtualModule } from './shader';
import { getHash } from './hash';
import { toBundle, getBundleHash, getBundleKey } from './bundle';
import { PREFIX_CHAIN } from '../constants';

const NO_SYMBOLS = [] as string[];

export type BundleToAttribute = (
  bundle: ShaderModule,
) => UniformAttribute;

export type MakeChainAccessor = (
  type: string,
  name: string,
  args: string[],
  from: string,
  to: string,
) => string;

export const makeChainTo = (
  makeChainAccessor: MakeChainAccessor,
  bundleToAttribute: BundleToAttribute,
) => (
  from: ShaderModule,
  to: ShaderModule,
): ParsedBundle => {
  const fBundle = toBundle(from);
  const tBundle = toBundle(to);
  
  const {module: fromModule, virtuals: fromVirtuals} = fBundle;
  const {module: toModule, virtuals: toVirtuals} = tBundle;

  const {name: fromName, format: fromFormat, args: fromArgs} = bundleToAttribute(from);
  const {name: toName, format: toFormat, args: toArgs} = bundleToAttribute(to);

  const entry = 'chain';

  const args = fromArgs;
  const check = toArgs;

  if (check?.length !== 1 || check[0] !== fromFormat) {
    throw new Error(`Cannot chain output ${fromFormat} of ${fromName} to args (${check?.join(', ')}) of ${toName}`);
  }

  const h1 = getBundleHash(fBundle);
  const h2 = getBundleHash(tBundle);

  const k1 = getBundleKey(fBundle);
  const k2 = getBundleKey(tBundle);

  const code    = `@chain [${entry}] [${h1}] [${h2}]`;
  const rehash  = getHash(code);
  const rekey   = getHash(`${code} ${k1} ${k2}`);
  const symbols = [entry, 'from', 'to'];

  const namespace1 = `${PREFIX_CHAIN}${rehash.slice(0, 6)}_1`;
  const namespace2 = `${PREFIX_CHAIN}${rehash.slice(0, 6)}_2`;

  const modules = [
    {
      at: 0,
      symbols: NO_SYMBOLS,
      name: namespace1,
      imports: [{name: 'from', imported: fromName}],
    },
    {
      at: 0,
      symbols: NO_SYMBOLS,
      name: namespace2,
      imports: [{name: 'to', imported: toName}],
    },
  ];

  // Code generator
  const render = (namespace: string, rename: Map<string, string>) => {
    const name = rename.get(entry) ?? entry;
    const from = rename.get('from') ?? 'from';
    const to = rename.get('to') ?? 'to';
    return makeChainAccessor(toFormat, name, args ?? [], from, to);
  }

  const chain = loadVirtualModule(
    { render },
    { symbols, modules },
    entry,
    rehash,
    code,
    rekey,
  );

  const revirtuals = [];
  if (fromVirtuals) revirtuals.push(...fromVirtuals);
  if (toVirtuals) revirtuals.push(...toVirtuals);
  if (fromModule.virtual) revirtuals.push(fromModule);
  if (toModule.virtual) revirtuals.push(toModule);

  return {module: chain, libs: {
    [namespace1]: from,
    [namespace2]: to,
  }, virtuals: revirtuals};
}
