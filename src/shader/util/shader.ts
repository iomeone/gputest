import { Tree } from '@lezer/common';
import { ASTParser, VirtualTable, SymbolTable, ParsedModule, ParsedModuleCache, CompressedNode } from '../types';
import { getProgramHash, makeKey } from './hash';
import { decompressAST } from './tree';
import { PREFIX_VIRTUAL } from '../constants';

const EMPTY_LIST = [] as any[];
const EMPTY_TABLE = {} as any;

// Parse a code module into its in-memory representation
// (AST + symbol table)
export const makeLoadModule = <T>(
  parseShader: (code: string) => Tree,
  makeASTParser: (code: string, tree: Tree, name?: string) => ASTParser<T>,
  compressAST: (code: string, tree: Tree) => CompressedNode[],
) => (
  code: string,
  name: string,
  entry?: string,
  compressed: boolean = false,
): ParsedModule => {
  if (code == null) throw new Error(`Shader code ${name} undefined`);
  if (typeof code !== 'string') throw new Error(`Shader code ${name} is not a string`);
  let tree = parseShader(code);

  const astParser = makeASTParser(code, tree, name);
  const table = astParser.getSymbolTable();
  const shake = astParser.getShakeTable(table);

  if (compressed) tree = decompressAST(compressAST(code, tree));

  return {name, code, table, entry, shake, tree};
}

// Use cache to load modules
export const makeLoadModuleWithCache = (
  loadModule: (code: string, name: string, entry?: string, compressed?: boolean) => ParsedModule,
  defaultCache: ParsedModuleCache,
) => (
  code: string,
  name: string,
  entry?: string,
  cache: ParsedModuleCache | null = defaultCache,
): ParsedModule => {
  if (!cache) return loadModule(code, name, entry, true);

  const hash = getProgramHash(code);
  const cached = cache.get(hash);
  if (cached) return {...cached, entry};
  
  const module = loadModule(code, name, entry, true);
  cache.set(hash, module);
  return {...module, entry};
}

// Load a static (inert) module
export const loadStaticModule = (code: string, name: string, entry?: string) => {
  const table = {
    hash: getProgramHash(code),
  };
  return { name, code, table, entry };
}

// Load a virtual (generated) module
export const loadVirtualModule = <T extends SymbolTable = any>(
  virtual: VirtualTable,
  initTable: Partial<T> = EMPTY_TABLE,
  entry?: string,
  key: string | number = makeKey(),
) => {
  let symbols = initTable.symbols ?? EMPTY_LIST;
  const code = `#virtual [${symbols.join(' ')}] ${key.toString(16)}`;

  const hash = getProgramHash(code);
  const name = `${PREFIX_VIRTUAL}${hash.slice(0, 6)}_`;

  const table = {
    hash,
    symbols,
    visibles: symbols,
    ...initTable,
  };
  return { name, code, table, entry, virtual };
}
