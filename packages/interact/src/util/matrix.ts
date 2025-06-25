import { seq, dot } from './vector';
import { clone } from './clone';

// Fill an array of length n with a value v
const fill   = (n: number, v = 0) => seq(n).map(_ => v);

// Fill an array of length n with all zeros except a single v at index i
const select = (n: number, i = n - 1, v = 1) => seq(n).map(j => i == j ? v : 0);

// Get matrix dimensions
export const dims = (m: number[][]) => [m.length, m[0].length];

// Pretty printing for debugging
const size = ([a, b]: number[]) => `${a}x${b}`;
const num = (x: number) => x == Math.round(x) ? (x|0) : (+x).toFixed(3);
const vec = (v: number[]) => `(${v.map(num).join(', ')})`;
const mat = (m: number[][]) => m.map(r => `[${r.map(num).join(', ')}]`).join("\n")+"\n";

// Fill an NxM matrix using a given expression
export const fill2d = (n: number, m: number, f: number = _ => 0) => {
  let out = [];
  for (let j = 0; j < n; ++j) {
    let row = [];
    for (let i = 0; i < m; ++i) {
      row[i] = f(i, j);
    }
    out.push(row);
  }
  return out;
}

// Identity matrix
export const identity = (n: number) => fill2d(n, n, (i, j) => +(i == j));

// Multiply two matrices
export const mul = (a: number[][], b: number[][]) => {
  let [na, ma] = dims(a);
  let [nb, mb] = dims(b);
  if (ma != nb) {
    console.error("Incompatible matrices", a, b, size(a), size(b));
    throw "Matrix error";
  }
  return fill2d(na, mb, (i, j) => dot(a[j], b.map(r => r[i])));
}

// Multiply two matrices while transposing the second
export const mulT = (a: number[][], b: number[][]) => {
  let [na, ma] = dims(a);
  let [mb, nb] = dims(b);
  if (ma != nb) {
    console.error("Incompatible matrices", a, b, size(a), size(b));
    throw "Matrix error";
  }
  return fill2d(na, mb, (i, j) => dot(a[j], b[i]));
}

// Transpose a matrix
export const transpose = (x: number[][]) => {
  let [n, m] = dims(x);
  return fill2d(m, n, (i, j) => x[i][j]);
}

// Concatenate two matrices horizontally
export const concat = (a: number[][], b: number[][]) => {
  let [na, ma] = dims(a);
  let [nb, mb] = dims(b);
  if (na != nb) {
    console.error("Incompatible matrices", a, b, size(a), size(b));
    throw "Matrix error";
  }
  return a.map((_,i) => a[i].concat(b[i]));
}

// Extract a submatrix from index (a,b) to (c,d) exclusive
export const submatrix = (M: number[][], a: number, b: number, c: number, d: number) => {
  let [n, m] = dims(M);

  a = Math.min(a, m);
  b = Math.min(b, n);

  if (c === undefined) c = m;
  if (d === undefined) d = n;

  c = Math.max(a, Math.min(m, c < 0 ? m + c : c));
  d = Math.max(b, Math.min(n, d < 0 ? n + d : d));

  return fill2d(d - b, c - a, (i, j) => M[j][i]);
}

// Get matrix rank
export const rank = (A: number[][]) => {
  let G = jordanNormal(A);
  return getDiagonalRank(G);
}

// Solve linear system of equations A X = B
export const solveLinear = (A: number[][], B: number[]) => {
  let [n, m] = dims(A);

  // Diagonalize system of equations
  let G = jordanNormal(concat(A, B));

  // Filter out zero rows
  G = G.filter(row => row.filter(x=>x).length > 0);
  n = G.length;

  if (n > m) {
    // Overdetermined, no solution
    return null;
  }

  if (!isJordanNormalDiagonal(G)) {
    // Underdetermined, no solution
    return null;
  }

  if (n == m) {
    // Extract exact solution
    let v = seq(m).map(i => G[i][m]);
    return v;
  }

  return null;
}

// Use lagrange multipliers to minimize distance to P subject to A X = B
export const lagrangeMinimumTo = (A: number[][], B: number[], P: number[]) => {
  let [n, m] = dims(A);

  let M = concat(A, fill2d(n, n));
  let T = seq(m).map(i => [
    ...select(m, i, 2), ...seq(n).map(j => -A[j][i]),
  ]);

  let AL = [...M, ...T];
  let BL = [...B, ...P.map(v => 2*v)];

  return [AL, BL];
}

// Solve overdetermined system with least squares
export const leastSquares = (A: number[][], B: number[]) => {
  let AT = transpose(A);

  let ATA = mul(AT, A);
  let ATB = mulT(AT, [B]);

  return [ATA, ATB];
}

// Solve overdetermined system with least squares
export const leastSquaresClosest = (A: number[][], B: number[], P: number[]) => {
  let [n, m] = dims(A);
  let d = P.length;

  let AP = A.concat(seq(d).map(i => select(d, i)));
  let BP = B.concat(P);

  return leastSquares(AP, BP);
}

// Swap a later row to make (i,j) non-zero
const swapZero = (x: number[][], i: number, j: number) => {
  let [n, m] = dims(x);
  for (let k = j + 1; k < n; ++k) {
    if (x[k][i] != 0) {
      [x[k],x[j]] = [x[j],x[k]];
      return true;
    }
  }
  return false;
}

// In-place vector ops to spare the GC

// Scale a row by a constant
const scaleRow = (a: number[], s: number) => {
  const {length} = a;
  for (let i = 0; i < length; ++i) a[i] *= s;
}

// Multiply and add one row to another
const madRow = (a: number[], b: number[], s: number) => {
  const {length} = a;
  for (let i = 0; i < length; ++i) a[i] += b[i] * s;
}

// Convert matrix into jordan normal form if possible
export const inverse = (x: number[][]) => {


  return x;
}

// Get determinant
export const determinant = (x: number[][]) => {
  const [n, m] = dims(x);
  let offset = 0;

  x = clone(x);

  let det = 1;

  for (let i = 0; i < Math.min(n, m); ++i) {
    // Find next pivot element
    let pivot = x[i][i + offset];

    if (pivot == 0) {
      // Unsuitable, find other row to swap with
      if (!swapZero(x, i + offset, i)) {

        // All zeros, move one column over until out of bounds
        if (offset++ >= (m - n)) {
          return 0;
        }
      }

      // Repeat iteration
      i--;
      continue;
    }

    // Scale pivot row
    scaleRow(x[i], 1 / pivot);

    det *= pivot;

    // Subtract from other rows
    for (let j = 0; j < n; ++j) if (i != j) {
      let pivot = x[j][i + offset];
      madRow(x[j], x[i], -pivot);
    }
  }

  return det;
}

// Convert matrix into jordan normal form if possible
export const jordanNormal = (x: number[][]) => {
  const [n, m] = dims(x);
  let offset = 0;

  // Don't modify argument
  x = clone(x);

  for (let i = 0; i < Math.min(n, m); ++i) {
    // Find next pivot element
    const pivot = x[i][i + offset];

    if (pivot == 0) {
      // Unsuitable, find other row to swap with
      if (!swapZero(x, i + offset, i)) {

        // All zeros, move one column over until out of bounds
        if (offset++ >= (m - n)) {
          return x;
        }
      }

      // Repeat iteration
      i--;
      continue;
    }

    // Scale pivot row
    scaleRow(x[i], 1 / pivot);

    // Subtract from other rows
    for (let j = 0; j < n; ++j) if (i != j) {
      const pivot = x[j][i + offset];
      madRow(x[j], x[i], -pivot);
    }
  }
  return x;
}

// Verify if matrix has uninterrupted non-zero diagonal
export const getDiagonalRank = (x: number[][]) => {
  let [n, m] = dims(x);
  let l = Math.min(n, m);
  for (let i = 0; i < l; ++i) {
    if (x[i][i] == 0) break;
  }
  return i;
}

// Verify if matrix is jordan normal on the diagonal
export const isJordanNormalDiagonal = (x: number[][]) => {
  let [n, m] = dims(x);
  let l = Math.min(n, m);
  for (let i = 0; i < l; ++i) {
    if (Math.abs(x[i][i] - 1) > 1e-2) return false;
  }
  return true;
}
