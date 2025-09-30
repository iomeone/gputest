import { UniformAttribute, ShaderModule, ParsedBundle, ParsedModule, RefFlags as RF } from '../../types';
import { loadVirtualModule } from '../shader';
import { toMurmur53, scrambleBits53, mixBits53 } from '../hash';
import { toBundle, getBundleHash, getBundleKey } from '../bundle';
import { formatFormat } from '../format';
import { mergeBindings } from '../bind';

export type BundleToAttribute = (
  bundle: ShaderModule,
) => UniformAttribute;

export type MakeChainAccessor = (
  type: string,
  name: string,
  args: string[],
  from: string,
  to: string,
  limit: number,
) => string;

const SYMBOLS = ['chain', 'from', 'to'];

const EXTERNALS = [
  {
    func: {name: 'from'},
    flags: RF.External,
  },
  {
    func: {name: 'to'},
    flags: RF.External,
  },
];

const makeDeclarations = (type: any, parameters: any) => [{
  func: {name: 'chain', type, parameters},
  flags: RF.Exported,
}] as any[];

export const makeChainTo = (
  makeChainAccessor: MakeChainAccessor,
  bundleToAttribute: BundleToAttribute,
) => (
  from: ShaderModule,
  to: ShaderModule,
): ParsedBundle => {
  const fBundle = toBundle(from);
  const tBundle = toBundle(to);

  const {name: fromName, format: fromFormat, type: fromType, args: fromArgs} = bundleToAttribute(from);
  const {name: toName, format: toFormat, type: toType, args: toArgs} = bundleToAttribute(to);

  const entry = 'chain';
  const args = fromArgs;

  const fromT = formatFormat(fromFormat, fromType);
  const isVoid = fromT === 'void';
  const restIndex = isVoid ? 0 : 1;

  // Return value of `from` must match 1st argument of `to`
  if (!isVoid && toArgs?.[0] !== fromT) {
    throw new Error(`Type Error: ${fromName} -> ${toName}.\nCannot chain output ${fromT} to args (${toArgs?.join(', ')}).`);
  }

  // Other arguments of `from` and `to` must match
  const toRest = toArgs?.slice(restIndex) ?? [];
  const fromRest = fromArgs?.slice(restIndex, restIndex + toRest.length) ?? [];
  if (fromRest.join('/') !== toRest.join('/')) {
    throw new Error(`Type Error: ${fromName} -> ${toName}.\nCannot chain remainder (..., ${fromRest.join(', ')}) to args (..., ${toRest.join(', ')}).`);
  }

  const h1 = getBundleHash(fBundle);
  const h2 = getBundleHash(tBundle);

  const k1 = getBundleKey(fBundle);
  const k2 = getBundleKey(tBundle);

  const code    = `@chain [${entry}]`;
  const rehash  = scrambleBits53(mixBits53(toMurmur53(code), mixBits53(h1, h2)));
  const rekey   = scrambleBits53(mixBits53(rehash, mixBits53(k1, k2)));

  // Code generator
  const render = (namespace: string, rename: Map<string, string>) => {
    const f = formatFormat(toFormat, toType);
    const format = rename.get(f) ?? f;
    const name = rename.get(entry) ?? entry;
    const from = rename.get('from') ?? 'from';
    const to = rename.get('to') ?? 'to';
    return makeChainAccessor(format, name, args ?? [], from, to, restIndex);
  }

  const exports = makeDeclarations(toFormat, fromArgs);

  const chain = loadVirtualModule(
    { render },
    { symbols: SYMBOLS, exports, externals: EXTERNALS },
    entry,
    rehash,
    code,
    rekey,
  );

  const rebound = new Set<ParsedModule>();
  mergeBindings(rebound, fBundle);
  mergeBindings(rebound, tBundle);

  return {
    module: chain,
    links: {
      from: fBundle,
      to: tBundle,
    },
    bound: rebound,
  };
}
