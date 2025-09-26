import { FontMetrics, SpanMetrics, GlyphMetrics, GPUTextContext } from './types';

let UseGPUText: typeof import('../pkg');

export const GPUText = async (): Promise<GPUTextContext> => {
  if (!UseGPUText) {
    ({UseGPUText} = await import('../pkg'));
  }

  const useGPUText = UseGPUText.new();

  const measureFont = (size: number): FontMetrics => {
    return useGPUText.measure_font(size);
  }

  const measureSpans = (text: string, size: number): SpanMetrics => {
    return useGPUText.measure_spans(text, size);
  }
  
  const measureGlyph = (id: number, size: number): GlyphMetrics => {
    return useGPUText.measure_glyph(id, size);
  }
  
  return {measureFont, measureSpans, measureGlyph};
}
