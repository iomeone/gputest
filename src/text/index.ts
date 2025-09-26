// src/text/index.ts （或你放最新版的那个文件）
import { FontMetrics, SpanMetrics, GlyphMetrics, GPUTextContext } from './types';

// 记一次模块初始化，避免重复 init()
let wasmModPromise: Promise<typeof import('../use-gpu-text/pkg/index.js')> | null = null;

export const GPUText = async (): Promise<GPUTextContext> => {
  // 按你的要求：显式加载 JS + 手动 init wasm（通过 URL 指向 index_bg.wasm）
  const mod = await (wasmModPromise ??= (async () => {
    const m = await import('../use-gpu-text/pkg/index.js');
    await m.default(new URL('../use-gpu-text/pkg/index_bg.wasm', import.meta.url));
    return m;
  })());

  // 拿到类并实例化
  const useGPUText = mod.UseGPUText.new();

  // 封装与作者一致的上下文 API
  const measureFont = (size: number): FontMetrics => {
    return useGPUText.measure_font(size);
  };

  const measureSpans = (text: string, size: number): SpanMetrics => {
    return useGPUText.measure_spans(text, size);
  };

  const measureGlyph = (id: number, size: number): GlyphMetrics => {
    return useGPUText.measure_glyph(id, size);
  };

  return { measureFont, measureSpans, measureGlyph };
};
