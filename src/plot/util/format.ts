export const formatNumber = (x: number, precision: number = 5) => {
  return x.toPrecision(precision).replace(/(?:\.0+)$|(\.[0-9]*[1-9])0+$/, '$1');
};
