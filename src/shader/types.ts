import { Tree } from '@lezer/common';
import LRU from 'lru-cache';
import MagicString from 'magic-string';

type ColorSpace = any;

type TypedArray =
  Int8Array |
  Uint8Array |
  Int16Array |
  Uint16Array |
  Int32Array |
  Uint32Array |
  Uint8ClampedArray |
  Float32Array |
  Float64Array;

export type ASTParser<T extends SymbolTableT = any> = {
  getSymbolTable: () => T,
  getShakeTable: (table?: T) => ShakeTable | undefined,
};

export type SymbolTableT = {
  types?: string[],
  symbols?: string[],
  modules?: {symbols: string[]}[],
  linkable?: Record<string, true>,
};

export type TypeLike = string | {
  name: string,
  args?: TypeLike[],
};

export type ParameterLike = string | {
  type: TypeLike,
};

export type FormatLike<T> = {
  format: string,
  type?: T,
};

export type ParsedModuleCache<T extends SymbolTableT = any> = LRU<number, ParsedModule<T>>;

export type ShaderModule<T extends SymbolTableT = any> = ParsedBundle<T> | ParsedModule<T>;

export type ParsedBundle<T extends SymbolTableT = any> = {
  module: ParsedModule<T>,
  libs?: Record<string, ShaderModule<T>>,
  links?: Record<string, ShaderModule<T>>,
  entry?: string,

  hash?: number,
  key?: number,
  defines?: Record<string, any>,
  bound?: Set<ParsedModule<T>>,
};

export type ParsedModule<T extends SymbolTableT = any> = {
  name: string,
  code: string,
  hash: number,
  table: T,

  tree?: Tree,
  shake?: ShakeTable,
  virtual?: VirtualTable<T>,
  entry?: string,
  label?: string,
  key?: number,
};

export type VirtualTable<T extends SymbolTableT = any> = {
  render: VirtualRender,
  uniforms?: DataBinding<T>[],
  storages?: DataBinding<T>[],
  textures?: DataBinding<T>[],
  bindingBase?: number,
  volatileBase?: number,
  namespace?: string,
};

export type BundleSummary = {
  link?: string,
  lib?: string,
  name: string,
  key: number,
  hash: number,
  depth: number,
};

export type DataBinding<T extends SymbolTableT = any> = {
  uniform: UniformAttribute,
  storage?: StorageSource,
  texture?: TextureSource,
  lambda?: LambdaSource<ShaderModule<T>>,
  constant?: any,
};

export type CompressedNode = [number, number, number] | [number, number, number, number];

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
  Infer    = 1 << 4,
  Binding  = 1 << 5,
};

export type ShaderDefine = string | number | boolean | null | undefined;

export type ShakeTable = ShakeOp[];
export type ShakeOp = [number, number[]];

export type StorageSource = {
  buffer: GPUBuffer,
  format: UniformFormat,
  type?: ShaderModule,
  length: number,
  size: number[] | TypedArray,
  version: number,

  volatile?: number,
  readWrite?: boolean,
  byteOffset?: number,
  byteLength?: number,
  colorSpace?: ColorSpace,
};

export type LambdaSource<T = any> = {
  shader: T,
  length: number,
  size: number[] | TypedArray,
  version: number,

  colorSpace?: ColorSpace,
};

export type TextureSource = {
  texture: GPUTexture,
  view?: GPUTextureView,
  sampler: GPUSampler | GPUSamplerDescriptor | null,
  layout: string,
  format: string,
  size: number[] | TypedArray,
  version: number,

  mips?: number,
  variant?: string,
  absolute?: boolean,
  comparison?: boolean,
  volatile?: number,
  colorSpace?: ColorSpace,
  aspect?: GPUTextureAspect,
};

export type ShaderSource = StorageSource | LambdaSource<ShaderModule> | TextureSource | ShaderModule;

export type UniformFormat = any | UniformAttribute[];

export type UniformAttribute = {
  name: string,
  format: UniformFormat,
  type?: ShaderModule,
  args?: any[] | null,
  members?: UniformAttribute[],
  attr?: UniformShaderAttribute[],
};

export type UniformShaderAttribute = string;

export type VirtualRender = (namespace: string, rename: Map<string, string>, virtualBase?: number, volatileBase?: number) => string;

export type TranspileOptions = {
  esModule?: boolean,
  minify?: boolean,
  types?: boolean,
  typeDef?: boolean,
  sourceMap?: boolean,
  importRoot?: string,
};

export type TranspileOutput = {
  output: string,
  typeDef: string | null,
  magicString: MagicString | null,
};
