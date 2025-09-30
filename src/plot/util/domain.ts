import type { DomainOptions } from '../types';
import { seq } from '@use-gpu/core';

// Generate equally spaced ticks in a range at sensible positions.
//
// @param min/max - Minimum and maximum of range
// @param divide - Desired number of steps in range
// @param unit - Base unit of scale (e.g. 1 or π).
// @param base - Division scale (e.g. 2 = binary division, or 10 = decimal division).
// @param factor - Multiplicative bias
// @param start - Whether to include a tick at the start
// @param end - Whether to include a tick at the end
// @param zero - Whether to include zero as a tick
// @param nice - Whether to round to a more reasonable interval

export const linear = (
  min: number,
  max: number,
  props: Partial<DomainOptions>,
) => {
  const {
    divide = 10,
    unit = 1,
    base = 10,
    start = true,
    end = true,
    zero = true,
    factor = 1,
    nice = true
  } = props;

  // Calculate naive tick size.
  const span = max - min;
  const ideal = span / divide;

  // Unsnapped division
  if (!nice) {
    let ticks = seq(divide + 1, min, ideal);
    if (!start) ticks.shift();
    if (!end) ticks.pop();
    if (!zero) ticks = ticks.filter(x => x != 0);
    return ticks;
  }

  // Round to the floor'd power of 'scale'
  const ref = unit * (Math.pow(base, Math.floor(Math.log(ideal / unit) / Math.log(base))))

  // Make derived steps at sensible factors.
  const factors =
    (base % 2 == 0) ? [base / 2, 1, 1 / 2] :
    (base % 3 == 0) ? [base / 3, 1, 1 / 3] :
    (base % 5 == 0) ? [base / 5, 1, 1 / 5] :
    [1];

  const steps = factors.map(f => ref * f);

  // Find step size closest to ideal.
  let distance = Infinity;
  const step = steps.reduce((ref: number, step: number) => {
    const f = step / ideal;
    const d = Math.max(f, 1 / f);

    if (d < distance) {
      distance = d;
      return step;
    } else {
      return ref;
    }
  }, ref);

  // Scale final step
  const final = step * factor;

  // Renormalize min/max onto aligned steps.
  min = Math.ceil ((min - span * (start ? 0.0001 : -0.0001)) / final) * final;
  max = Math.floor((max + span * (end   ? 0.0001 : -0.0001)) / final) * final;
  const n = Math.round((max - min) / final);

  // Generate equally spaced ticks
  let ticks = seq(n + 1, min, step);
  if (!zero) ticks = ticks.filter((x) => x != 0);

  return ticks;
}

// Generate logarithmically spaced ticks in a range at sensible positions.

export const logarithmic = (
  min: number,
  max: number,
  props: Partial<DomainOptions>
) => {
  const {base = 10} = props;

  const minL = Math.log(min) / Math.log(base);
  const maxL = Math.log(min) / Math.log(base);

  const ticks = linear(minL, maxL, props);
  return ticks.map(x => Math.pow(base, x));
}
