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

export const injectMethodLogger = (obj: object, label: string) => {
  for (const k in obj) {
    const v = obj[k];
    if (typeof v === 'function') {
      const f = v.bind(obj);
      const l = label ? `${label} ${k}` : k;

      obj[k] = (...args) => {
        console.log(l, ...args);
        const v = f(...args);
        if (typeof v === 'object') return injectMethodLogger(v, l);
      };
    }
  }
  return obj;
};
