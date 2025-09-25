import { FontMetrics, TextMetrics } from './types';

let useGPUText: typeof import('../pkg');

export const GPUText = async () => {
  const { UseGPUText } = await import('../pkg');
  return useGPUText = UseGPUText.new();
}

export const getLineBreaks = (text: string): number[] => {
  if (!useGPUText) throw new Error("GPUText not loaded");
  return useGPUText.get_line_breaks(text);
}

export const measureFont = (size: number): FontMetrics => {
  if (!useGPUText) throw new Error("GPUText not loaded");
  return useGPUText.measure_font(size);
}

export const measureText = (text: string, size: number): TextMetrics => {
  if (!useGPUText) throw new Error("GPUText not loaded");
  return useGPUText.measure_text(text, size);
}
