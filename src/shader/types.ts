import { Tree, SyntaxNode } from '@lezer/common';
import LRU from 'lru-cache';

export type ParsedModuleCache = LRU<string, ParsedModule>;

export type ShaderModule = ParsedBundle | ParsedModule;

export type ParsedBundle = {
  module: ParsedModule,
  libs?: Record<string, ShaderModule>,
  entry?: string,
  virtual?: ParsedModule[],
};

export type ParsedModule = {
  name: string,
  code: string,
  table: SymbolTable,
  tree?: Tree,
  shake?: ShakeTable,
  virtual?: VirtualTable,
  entry?: string,
};

export type ComboRef = ModuleRef | FunctionRef | DeclarationRef;

export type CompressedNode = [string, number, number];

export type SymbolTable = {
  hash: string,
  symbols?: SymbolRef[],
  visibles?: SymbolRef[],
  globals?: SymbolRef[],
  modules?: ModuleRef[],
  functions?: FunctionRef[],
  declarations?: DeclarationRef[],
  externals?: DeclarationRef[],
};

export type ShakeTable = ShakeOp[];
export type ShakeOp = [number, string[]];

export type VirtualTable = {
  render: VirtualRender,
  uniforms?: DataBinding[],
  bindings?: DataBinding[],
  base?: number,
  namespace?: string,
};

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
export type ShaderCompiler = (code: string, stage: string) => Uint8Array | Uint32Array;

export type StorageSource = {
  buffer: GPUBuffer,
  format: string,
  length: number,
};

export type UniformAttribute = {
  name: string,
  format: string,
  args?: string[],
};

export type UniformAttributeValue = UniformAttribute & {
  value: any,
};

export type DataBinding = {
  uniform: UniformAttributeValue,
  storage?: StorageSource,
  lambda?: ParsedBundle | ParsedModule,
  constant?: any,
};

export type VirtualRender = (namespace: string, rename: Map<string, string>, base: number) => string;
