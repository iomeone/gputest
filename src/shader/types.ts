import { Tree, SyntaxNode } from '@lezer/common';
import LRU from 'lru-cache';

export type ParsedModuleCache = LRU<string, ParsedModule>;

export type ParsedBundle = {
  module: ParsedModule,
  libs: Record<string, ParsedBundle>,
  entry?: string,
};

export type ParsedModule = {
  name: string,
  code: string,
  tree: Tree,
  table: SymbolTable,
  shake?: ShakeTable,
  entry?: string,
};

export type ComboRef = ModuleRef | FunctionRef | DeclarationRef;

export type CompressedNode = [string, number, number];

export type SymbolTable = {
  hash: string,
  symbols: SymbolRef[],
  visibles: SymbolRef[],
  globals: SymbolRef[],
  modules: ModuleRef[],
  functions: FunctionRef[],
  declarations: DeclarationRef[],
  externals: DeclarationRef[],
};

export type ShakeTable = ShakeOp[];
export type ShakeOp = [number, string[]];

export enum RefFlags {
  Exported = 1,
  Optional = 1 << 1,
  Global   = 1 << 2,
};

export type SymbolRef = string;

export type ImportRef = {
  name: string,
  imported: string,
}

export type SymbolsRef = {
  at: number,
  symbols: SymbolRef[],
}

export type ModuleRef = SymbolsRef & {
  name: string,
  imports: ImportRef[],
}

export type FunctionRef = SymbolsRef & {
  prototype: PrototypeRef,
  identifiers?: string[],
  flags: RefFlags,
}

export type DeclarationRef = SymbolsRef & {
  prototype?: PrototypeRef,
  variable?: VariableRef,
  struct?: QualifiedStructRef,
  identifiers?: string[],
  flags: RefFlags,
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

export type ShaderDefine = string | number | boolean | null | undefined;
