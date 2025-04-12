import { UniformAttribute, ShaderModule, ParsedBundle, ParsedModule, ModuleRef, RefFlags as RF } from '../../types';
import { loadVirtualModule } from '../shader';
import { toMurmur53, scrambleBits53, mixBits53 } from '../hash';
import { toBundle, getBundleEntry, getBundleHash, getBundleKey } from '../bundle';
import { formatFormat } from '../format';
import { mergeBindings } from '../bind';
import zipObject from 'lodash/zipObject.js';

export type BundleToAttribute = (
  bundle: ShaderModule,
) => UniformAttribute;

export type MakeChainAccessor = (
  type: string,
  name: string,
  args: string[],
  from: string,
  to: string,
  rest?: number,
  length?: number,
) => string;

const EMPTY: any[] = [];

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

const extractImports = (bundle: ParsedBundle, symbols: string[]): ModuleRef[] => {
  const refs: ModuleRef[] = [];
  const {module: {table}} = bundle;

  if (table.modules) for (const i of table.modules) {
    const syms = i.symbols.filter((s: string) => symbols.includes(s));
    if (syms.length) {
      refs.push({...i, symbols: syms});
    }
  }

  return refs;
};

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
  const isStruct = fromT.match(/^[A-Z]/);
  const isVoid = fromT === 'void';
  const isAuto = fromT.match(/auto(<|$)/);
  const restIndex = isVoid ? 0 : 1;

  // Return value of `from` must match 1st argument of `to`
  if (!isStruct && !isAuto && !isVoid && toArgs?.[0] !== fromT) {
    throw new Error(`Type Error: ${fromName} -> ${toName}.\nCannot chain output ${fromT} to args (${toArgs?.join(', ')}).`);
  }

  // Other arguments of `from` and `to` must match
  const toRest = toArgs?.slice(restIndex) ?? EMPTY;
  const fromRest = fromArgs?.slice(restIndex, restIndex + toRest.length) ?? EMPTY;
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

  const exports = makeDeclarations(toFormat, fromArgs);

  // Code generator
  const render = (namespace: string, rename: Map<string, string>) => {
    const f = formatFormat(toFormat, toType);
    const format = rename.get(f) ?? f;
    const name = rename.get(entry) ?? entry;
    const from = rename.get('from') ?? 'from';
    const to = rename.get('to') ?? 'to';
    return makeChainAccessor(format, name, args ?? EMPTY, from, to, restIndex, toRest.length);
  }

  // If using imported types, adopt imports
  const importSymbols = [...fromArgs ?? EMPTY, ...toArgs ?? EMPTY];
  if (fromType) importSymbols.push(getBundleEntry(fromType));
  if (toType) importSymbols.push(getBundleEntry(toType));

  const fImports = extractImports(fBundle, importSymbols) ?? EMPTY;
  const tImports = extractImports(tBundle, importSymbols) ?? EMPTY;

  const imports = [...fImports, ...tImports];
  const modules = [
    ...extractImports(fBundle, importSymbols),
    ...extractImports(tBundle, importSymbols),
  ];

  const fLibs = fBundle.libs;
  const tLibs = tBundle.libs;
  const libs = {
    ...(fLibs ? zipObject(fImports.map(m => m.name), fImports.map(m => fLibs[m.name])) : undefined),
    ...(tLibs ? zipObject(tImports.map(m => m.name), tImports.map(m => tLibs[m.name])) : undefined),
  }

  // Make virtual module
  const chain = loadVirtualModule(
    { render },
    { symbols: SYMBOLS, externals: EXTERNALS, exports, modules },
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
    libs,
    links: {
      from: fBundle,
      to: tBundle,
    },
    bound: rebound,
  };
}
