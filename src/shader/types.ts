import { Tree, SyntaxNode } from '@lezer/common';
import LRU from 'lru-cache';

export type ASTParser<T extends SymbolTable = any> = {
  getSymbolTable: () => T,
  getShakeTable: (table?: T) => ShakeTable | undefined,
};

export type SymbolTable = {
  symbols?: string[],
};

export type ParsedModuleCache<T extends SymbolTable = any> = LRU<string, ParsedModule<T>>;

export type ShaderModule<T extends SymbolTable = any> = ParsedBundle<T> | ParsedModule<T>;

export type ParsedBundle<T extends SymbolTable = any> = {
  module: ParsedModule<T>,
  libs?: Record<string, ShaderModule<T>>,
  entry?: string,
  virtual?: ParsedModule<T>[],
};

export type ParsedModule<T extends SymbolTable = any> = {
  name: string,
  code: string,
  table: T,
  tree?: Tree,
  shake?: ShakeTable,
  virtual?: VirtualTable<T>,
  entry?: string,
};

export type VirtualTable<T extends SymbolTable = any> = {
  render: VirtualRender,
  uniforms?: DataBinding<T>[],
  storages?: DataBinding<T>[],
  textures?: DataBinding<T>[],
  base?: number,
  namespace?: string,
};

export type DataBinding<T extends SymbolTable = any> = {
  uniform: UniformAttributeValue,
  storage?: StorageSource,
  texture?: TextureSource,
  lambda?: ShaderModule<T>,
  constant?: any,
};

export type CompressedNode = [string, number, number];

export type ImportRef = {
  name: string,
  imported: string,
};

export type ModuleRef = {
  at: number,
  symbols: string[],
  name: string,
  imports: ImportRef[],
};

export enum RefFlags {
  Exported = 1,
  External = 1 << 1,
  Optional = 1 << 2,
  Global   = 1 << 3,
};

export type ShaderDefine = string | number | boolean | null | undefined;

export type ShakeTable = ShakeOp[];
export type ShakeOp = [number, string[]];

export type StorageSource = {
  buffer: GPUBuffer,
  format: string,
  length: number,
  version: number,
};

export type TextureSource = {
  view: GPUTexture | GPUTextureView,
  sampler: GPUSampler | GPUSamplerDescriptor,
  layout: string,
  format: string,
  size: [number, number] | [number, number, number],
  version: number,
};

export type UniformAttribute = {
  name: string,
  format: string,
  args?: string[],
};

export type UniformAttributeValue = UniformAttribute & {
  value: any,
};

export type VirtualRender = (namespace: string, rename: Map<string, string>, base: number) => string;
