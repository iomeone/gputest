import { Tree, SyntaxNode } from '@lezer/common';
import LRU from 'lru-cache';

export type ParsedModuleCache = LRU<string, {tree: Tree, table: SymbolTable}>;

export type ParsedModule = {
  name: string,
  code: string,
  tree: Tree,
  table: SymbolTable,
};
export type ComboRef = ModuleRef | FunctionRef | DeclarationRef;

export type CompressedNode = [string, number, number];

export type SymbolTable = {
  hash: string,
  refs: ComboRef[],
  symbols: SymbolRef[],
  visibles: SymbolRef[],
  modules: ModuleRef[],
  functions: FunctionRef[],
  declarations: DeclarationRef[],
  externals: DeclarationRef[],
};

export type SymbolRef = string;

export type SymbolsRef = {
  symbols: SymbolRef[],
}

export type ImportRef = {
  name: string,
  imported: string,
}

export type ModuleRef = SymbolsRef & {
  name: string,
  imports: ImportRef[],
}

export type FunctionRef = SymbolsRef & {
  prototype: PrototypeRef,
  exported: boolean,
}

export type DeclarationRef = SymbolsRef & {
  prototype?: PrototypeRef,
  variable?: VariableRef,
  struct?: QualifiedStructRef,
  exported: boolean,
}

export type TypeRef = {
  name: string,
  qualifiers?: string[],
  members?: MemberRef[],
}

export type PrototypeRef = {
  type: TypeRef,
  name: string,
  parameters: string[],
}

export type VariableRef = {
  type: TypeRef,
  locals: LocalRef[],
}

export type MemberRef = {
  type: TypeRef,
  name: string,
}

export type LocalRef = {
  name: string,
  expr: any,
}

export type QualifiedStructRef = {
  type: TypeRef,
  name: string,
  struct: StructRef,
}

export type StructRef = {
  members: MemberRef[],
}
