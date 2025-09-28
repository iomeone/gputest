let __mikkt: any = null;
let __mikktReady: Promise<void> | null = null;

export const initMikkt = () =>
  (__mikktReady ??= (async () => {
    // 路径按你的实际放置
    const mod = await import('../mikktspace/pkg');
    await mod.default(new URL('../mikktspace/pkg/index_bg.wasm', import.meta.url));
    __mikkt = mod;
  })());

export const generateTangents = (...args: any[]) => {
  if (!__mikkt) throw new Error('mikktspace not initialized. Call `await initMikkt()` first.');
  return __mikkt.generateTangents(...args);
};
