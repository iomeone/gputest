let useGPUText: typeof import('../use-gpu-text/pkg');

export const GPUText = async () => {
  console.log("GPUText = async ()");
  // const { UseGPUText } = await import('../use-gpu-text/pkg');
  const { default: init, UseGPUText } = await import('../use-gpu-text/pkg/index.js');
  await init(new URL('../use-gpu-text/pkg/index_bg.wasm', import.meta.url));

  
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
