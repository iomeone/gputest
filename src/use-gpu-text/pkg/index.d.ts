/* tslint:disable */
/* eslint-disable */
export function init_panic_hook(): void;
export class UseRustText {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  static new(): UseRustText;
  load_font(key: number, ttf: Uint8Array): any;
  unload_font(key: number): any;
  load_image_font(key: number, utf16: Uint16Array): any;
  unload_image_font(key: number): any;
  load_image_rgba(key: number, glyph: number, rgba: Uint8Array, width: number, height: number): any;
  load_image_png(key: number, glyph: number, png: Uint8Array): any;
  unload_image(key: number, glyph: number): any;
  measure_font(key: number, size: number): any;
  measure_spans(stack: Float64Array, utf16: Uint16Array, size: number): any;
  find_glyph(key: number, utf16: Uint16Array): any;
  measure_glyph(key: number, id: number, size: number): any;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_userusttext_free: (a: number, b: number) => void;
  readonly userusttext_new: () => number;
  readonly userusttext_load_font: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly userusttext_unload_font: (a: number, b: number) => [number, number, number];
  readonly userusttext_load_image_font: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly userusttext_unload_image_font: (a: number, b: number) => [number, number, number];
  readonly userusttext_load_image_rgba: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number];
  readonly userusttext_load_image_png: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
  readonly userusttext_unload_image: (a: number, b: number, c: number) => [number, number, number];
  readonly userusttext_measure_font: (a: number, b: number, c: number) => [number, number, number];
  readonly userusttext_measure_spans: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
  readonly userusttext_find_glyph: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly userusttext_measure_glyph: (a: number, b: number, c: number, d: number) => [number, number, number];
  readonly init_panic_hook: () => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_3: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
