import { Tree, SyntaxNode } from '@lezer/common';

export type ComboRef = ModuleRef | FunctionRef | DeclarationRef;

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

export type SymbolsRef = {
  symbols: SymbolRef[],
}

export type SymbolRef = {
  node: SyntaxNode,
  name: string,
}

export type ImportRef = {
  node: SyntaxNode,
  name: string,
  imported: string,
}

export type ModuleRef = SymbolsRef & {
  name: string,
  imports: ImportRef[],
}

export type FunctionRef = SymbolsRef & {
  node: SyntaxNode,
  prototype: PrototypeRef,
}

export type DeclarationRef = SymbolsRef & {
  node: SyntaxNode,
  prototype?: PrototypeRef,
  variable?: VariableRef,
  struct?: QualifiedStructRef,
}

export type TypeRef = {
  node: SyntaxNode,
  name: string,
  qualifiers?: string[],
  members?: MemberRef[],
}

export type PrototypeRef = {
  node: SyntaxNode,
  type: TypeRef,
  name: string,
  parameters: string[],
}

export type VariableRef = {
  node: SyntaxNode,
  type: TypeRef,
  locals: LocalRef[],
}

export type MemberRef = {
  node: SyntaxNode,
  type: TypeRef,
  name: string,
}

export type LocalRef = {
  node: SyntaxNode,
  name: string,
  expr: any,
}

export type QualifiedStructRef = {
  node: SyntaxNode,
  type: TypeRef,
  name: string,
  struct: StructRef,
}

export type StructRef = {
  node: SyntaxNode,
  members: MemberRef[],
}
