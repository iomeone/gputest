// src/vendor/rust-text.ts
// 统一管理 RustText wasm 的加载与实例缓存

let __rtMod: any = null;          // wasm JS 模块 (pkg/index.js 的导出对象)
let __rtInstance: any = null;     // UseRustText.new() 实例
let __rtReady: Promise<void> | null = null;

/** 只初始化一次（在应用启动时 await 一下） */
export const initRustText = () =>
  (__rtReady ??= (async () => {
    // 注意：此处路径基于本文件位于 src/vendor 下，wasm 包在 src/use-gpu-text/pkg
    const mod = await import('../use-gpu-text/pkg/index.js');
    // 显式初始化 wasm（async WebAssembly）
    await mod.default(new URL('../use-gpu-text/pkg/index_bg.wasm', import.meta.url));

    __rtMod = mod;
    __rtInstance = mod.UseRustText.new();
  })());

/** 获取已经初始化好的实例；若未调用 init 会抛错 */
export const getRustText = () => {
  if (!__rtInstance) {
    throw new Error('RustText not initialized. Call `await initRustText()` once at startup.');
  }
  return __rtInstance;
};

/** （可选）需要时可拿到整个 wasm 模块对象 */
export const getRustTextModule = () => {
  if (!__rtMod) {
    throw new Error('RustText module not initialized. Call `await initRustText()` once at startup.');
  }
  return __rtMod;
};
