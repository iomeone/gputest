let useGPUText: typeof import('../pkg');

export const GPUText = async () => {
  const { UseGPUText } = await import('../pkg');
  return useGPUText = UseGPUText.new();
}

export const getLineBreaks = (text: string) => {
  if (!useGPUText) throw new Error("GPUText not loaded");
  return useGPUText.get_line_breaks(text);
}

export const getMetrics = (text: string, size: number) => {
  if (!useGPUText) throw new Error("GPUText not loaded");
  return useGPUText.get_metrics(text, size);
}
