import { Tree } from '@lezer/common';
import { ASTParser, VirtualTable, SymbolTableT, ParsedBundle, ParsedModule, ParsedModuleCache, CompressedNode } from '../types';
import { formatMurmur53, toMurmur53 } from './hash';
import { PREFIX_VIRTUAL } from '../constants';

const EMPTY_LIST = [] as any[];
const EMPTY_TABLE = {} as any;

// Parse a code module into its in-memory representation
// (AST + symbol table)
export const makeLoadModule = <T extends SymbolTableT = any>(
  parseShader: (code: string) => Tree,
  makeASTParser: (code: string, tree: Tree, name?: string) => ASTParser<T>,
  compressAST: (code: string, tree: Tree, symbols?: T['symbols'], modules?: T['modules']) => CompressedNode[],
  decompressAST: (nodes: CompressedNode[], symbols?: T['symbols']) => Tree,
) => (
  code: string,
  name: string = 'main',
  entry?: string,
  compressed: boolean = false,
): ParsedModule => {
  if (code == null) throw new Error(`Shader code ${name} undefined`);
  if (typeof code !== 'string') throw new Error(`Shader code ${name} is not a string`);
  let tree = parseShader(code);

  const astParser = makeASTParser(code, tree, name);
  const table = astParser.getSymbolTable();
  const shake = astParser.getShakeTable(table);

  if (compressed) {
    const {symbols, modules} = table;
    tree = decompressAST(compressAST(code, tree, symbols, modules), symbols);
  }
  const hash = toMurmur53(code);

  return bindEntryPoint({name, code, hash, table, shake, tree} as ParsedModule, entry);
}

// Use cache to load modules
export const makeLoadModuleWithCache = (
  loadModule: (code: string, name?: string, entry?: string, compressed?: boolean) => ParsedModule,
  defaultCache: ParsedModuleCache,
) => (
  code: string,
  name?: string,
  entry?: string,
  cache: ParsedModuleCache | null = defaultCache,
): ParsedModule => {
  if (!cache) return loadModule(code, name, entry, true);

  const hash = toMurmur53(code);
  const cached = cache.get(hash);
  if (cached) {
    return bindEntryPoint(cached, entry);
  }

  const module = loadModule(code, name, undefined, true);
  cache.set(hash, module);
  return bindEntryPoint(module, entry);
}

// Load a static (inert) module
export const loadStaticModule = (code: string, name: string, entry?: string) => {
  const hash = toMurmur53([code, entry]);
  return ({ name, code, hash, table: EMPTY_TABLE, label: '@static ' + (entry ?? name) });
}

// Load a virtual (generated) module
export const loadVirtualModule = <T extends SymbolTableT = any>(
  virtual: VirtualTable,
  initTable: Partial<T> = EMPTY_TABLE,
  entry?: string,
  hash?: number,
  code?: string,
  key?: number,
) => {
  const symbols = initTable.symbols ?? EMPTY_LIST;

  code = code ?? `@virtual [${symbols.join(' ')}]`;
  hash = hash ?? toMurmur53(code);
  key  = key  ?? hash;

  const name = `${PREFIX_VIRTUAL}${formatMurmur53(key).slice(0, 6)}`;

  const table = {
    symbols,
    visibles: symbols,
    ...initTable,
  };
  return { name, code, hash, table, entry, virtual, key, label: code };
}

// Set entry point of a module, returns new bundle/module.
// Is the same instance as the original (key = old key/hash), so it merges with copies of itself.
// But is structurally different (hash = new entry), so differences in links are reflected in the shader hash.
export const bindEntryPoint = <T extends ParsedBundle | ParsedModule>(bundle: T, entry?: string): T => {
  // eslint-disable-next-line prefer-const
  let {key, hash, module, table} = bundle as any;

  table = table ?? module?.table;
  hash = hash ?? module?.hash;
  key = key ?? module?.key;

  if (entry == null && table.symbols?.includes('main')) entry = 'main';
  if (entry == null) return bundle;

  const structural = toMurmur53([hash, entry]);
  return {...bundle, entry, hash: structural, key: key ?? hash};
};
