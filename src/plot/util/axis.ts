export const recenterAxis = (x: number, dx: number, bend: number, shift: number = 0) => {
  if (bend > 0) {
    const x1 = x;
    const x2 = x + dx;

    const abs = Math.max(Math.abs(x1), Math.abs(x2));
    const fabs = abs * shift;

    const min = Math.min(x1, x2);
    const max = Math.max(x1, x2);

    x = min + (-abs + fabs - min) * bend;
    dx = max + (abs + fabs - max) * bend - x;
  }

  return [x, dx];
};
