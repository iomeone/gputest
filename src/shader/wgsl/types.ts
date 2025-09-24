import {
  ParsedModuleCache as ParsedModuleCacheT,
  ParsedBundle as ParsedBundleT,
  ParsedModule as ParsedModuleT,
  ShaderModule as ShaderModuleT,
  VirtualTable as VirtualTableT,
  DataBinding as DataBindingT,
  ImportRef,
  RefFlags,
} from '../types';

export {
  RefFlags,
} from '../types';

export type {
  CompressedNode,
  ImportRef,
  ShakeTable,
  ShakeOp,
  ShaderDefine,
  StorageSource,
  UniformAttribute,
  UniformAttributeValue,
  VirtualRender,
} from '../types';

export type ParsedModuleCache = ParsedModuleCacheT<SymbolTable>;
export type ParsedBundle = ParsedBundleT<SymbolTable>;
export type ParsedModule = ParsedModuleT<SymbolTable>;
export type ShaderModule = ShaderModuleT<SymbolTable>;
export type VirtualTable = VirtualTableT<SymbolTable>;
export type DataBinding = DataBindingT<SymbolTable>;

export type SymbolTable = {
  hash: string,
  modules?: ModuleRef[],
  declarations?: DeclarationRef[],
  externals?: DeclarationRef[],
  symbols?: string[],
  visibles?: string[],
  globals?: string[],
};

export type ModuleRef = {
  at: number,
  symbols: string[],
  name: string,
  imports: ImportRef[],
};

export type DeclarationRef = {
  at: number,
  symbol: string,
  flags: RefFlags,
  func?: FunctionRef,
  variable?: VariableRef,
  constant?: VariableRef,
  alias?: TypeAliasRef,
  struct?: StructRef,
};

export type AttributesRef = {
  attributes?: AttributeRef[],
};

export type IdentifiersRef = {
  identifiers?: string[],
};

export type AttributeRef = {
  name: string,
  args?: string[],
};

export type TypeRef = {
  name: string,
  args?: TypeRef[],
};

export type TypeAliasRef = AttributesRef & {
  name: string,
  type: TypeRef,
};

export type QualifiedTypeAliasRef = TypeAliasRef & {
  qual?: string,
};

export type FunctionRef = AttributesRef & IdentifiersRef & FunctionHeaderRef;
export type VariableRef = AttributesRef & IdentifiersRef & VariableDeclarationRef;
export type AnnotatedTypeRef = AttributesRef & TypeRef;

export type ParameterRef = AttributesRef & {
  name: string,
  type: TypeRef,
};

export type FunctionHeaderRef = {
  name: string,
  type: AnnotatedTypeRef,
  parameters?: ParameterRef[] | string[],
};

export type VariableDeclarationRef = {
  name: string,
  type: TypeRef,
  qual?: string,
  value?: string,
};

export type StructMemberRef = AttributesRef & {
  name: string,
  type: TypeRef,
};

export type StructRef = AttributesRef & {
  name: string,
  members: StructMemberRef[],
};
