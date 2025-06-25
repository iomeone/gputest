// Simple deep object clone
export const clone = (x: object) => JSON.parse(JSON.stringify(x));
