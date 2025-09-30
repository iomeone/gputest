export type Axis4 = 'x' | 'y' | 'z' | 'w';
export type Swizzle = string;

export type DomainOptions = {
  /** @param divide - Desired number of steps in range */
  divide: number,
  /** @param unit - Base unit of scale (e.g. 1 or π). */
  unit: number,
  /** @param base - Division scale (e.g. 2 = binary division, or 10 = decimal division). */
  base: number,
  /** @param start - Whether to include a tick at the start */
  start: boolean,
  /** @param end - Whether to include a tick at the end */
  end: boolean,
  /** @param zero - Whether to include zero as a tick */
  zero: boolean,
  /** @param factor - Multiplicative bias */
  factor: number,
  /** @param nice - Whether to round to a more reasonable interval */
  nice: boolean,
};
