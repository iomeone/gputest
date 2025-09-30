/** @hidden */
export const LOGGING = {
  buffer: false,
  pipeline: false,
} as Record<string, boolean>;

export const decodeUsageFlags = (flags: GPUBufferUsageFlags) => {
  const out: Record<string, true>  = {};
  for (const k in GPUBufferUsage) if (flags & (GPUBufferUsage as any)[k]) out[k] = true;
  return out;
};