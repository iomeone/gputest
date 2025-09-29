import type { SlideInfo, ResolvedSlide } from '../types';

export const merge = (a: object, b: object) => {
  const o = {...a} as any;
  const bb = b as any;
  for (const k in bb) if (bb[k] != null) o[k] = bb[k];
  return o;
};

export const resolveSlides = (slides: SlideInfo[]) => {
  const out: ResolvedSlide[] = [];
  const ordered = slides.slice();
  ordered.sort(({order: a}, {order: b}) => (a ?? 1e8) - (b ?? 1e8));

  let accum = 0;
  const summed = ordered.reduce((list, {steps = 1}) => {
    if (steps) {
      list.push(accum += steps);
    }
    return list;
  }, [0]);

  const n = summed.length;
  const last = summed[summed.length - 1];

  let i = 0;
  for (const {id, steps = 1, stay = 0, slides, sticky, thread} of ordered) {
    const from = summed[i];
    const to = stay
      ? summed[i + stay] ?? (last + stay - (n - i))
      : sticky
        ? Infinity
        : summed[i + 1];

    const shift = from + 1;
    out.push({id, from, to, thread});
    if (slides) {
      out.push(...slides.map(({from, to, ...rest}) => ({
        ...rest,
        from: from + shift,
        to: to + shift,
      })));
    }

    if (steps) i++;
  }

  return {resolved: out, length: last};
};
