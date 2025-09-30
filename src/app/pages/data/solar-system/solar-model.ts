import type { Emit } from '../../../../core';
import { parseColor } from '../../../../parse';

type Orbit = {
  N: number,
  i: number,
  w: number,
  a: number,
  e: number,
  M: number,
};

// Unix timestamp in seconds to (floating point) day number
const ZULU = +new Date("1999-12-31T00:00Z") / 1000;
export const getDayNumber = (t: number) => {
  return (t - ZULU) / (60 * 60 * 24);
};


// Orbital elements
// Source: http://www.stjarnhimlen.se/comp/ppcomp.html
const BODIES = [
  {
    label: 'Sun',
    color: parseColor('#ffb600'),
    orbit: () => ({
      N: 0,
      i: 0,
      w: 0,
      a: 0,
      e: 0,
      M: 0,
    }),
  },
  {
    label: 'Mercury',
    color: parseColor('#ccaa72'),
    orbit: (d: number) => ({
      N:  48.3313 + 3.24587E-5 * d,
      i:   7.0047 + 5.00E-8 * d,
      w:  29.1241 + 1.01444E-5 * d,
      a: 0.387098,
      e: 0.205635 + 5.59E-10 * d,
      M: 168.6562 + 4.0923344368 * d,
    }),
  },
  {
    label: 'Venus',
    color: parseColor('#ffe9ba'),
    orbit: (d: number) => ({
      N:  76.6799 + 2.46590E-5 * d,
      i:   3.3946 + 2.75E-8 * d,
      w:  54.8910 + 1.38374E-5 * d,
      a: 0.723330,
      e: 0.006773 - 1.302E-9 * d,
      M:  48.0052 + 1.6021302244 * d,
    }),
  },
  {
    label: 'Earth',
    color: parseColor('#67c8ff'),
    orbit: (d: number) => ({
      N: 0.0,
      i: 0.0,
      w: 282.9404 + 4.70935E-5 * d,
      a: 1.000000,
      e: 0.016709 - 1.151E-9 * d,
      M: 356.0470 + 0.9856002585 * d,
    }),
  },
  {
    label: 'Mars',
    color: parseColor('#f87f50'),
    orbit: (d: number) => ({
      N:  49.5574 + 2.11081E-5 * d,
      i:   1.8497 - 1.78E-8 * d,
      w: 286.5016 + 2.92961E-5 * d,
      a: 1.523688,
      e: 0.093405 + 2.516E-9 * d,
      M:  18.6021 + 0.5240207766 * d,
    }),
  },
  {
    label: 'Jupiter',
    color: parseColor('#cccbb7'),
    orbit: (d: number) => ({
      N: 100.4542 + 2.76854E-5 * d,
      i:   1.3030 - 1.557E-7 * d,
      w: 273.8777 + 1.64505E-5 * d,
      a: 5.20256,
      e: 0.048498 + 4.469E-9 * d,
      M:  19.8950 + 0.0830853001 * d,
    }),
  },
  {
    label: 'Saturn',
    color: parseColor('#e6db7c'),
    orbit: (d: number) => ({
      N: 113.6634 + 2.38980E-5 * d,
      i:   2.4886 - 1.081E-7 * d,
      w: 339.3939 + 2.97661E-5 * d,
      a: 9.55475,
      e: 0.055546 - 9.499E-9 * d,
      M: 316.9670 + 0.0334442282 * d,
    }),
  },
  {
    label: 'Uranus',
    color: parseColor('#c4e7e9'),
    orbit: (d: number) => ({
      N:  74.0005 + 1.3978E-5 * d,
      i:   0.7733 + 1.9E-8 * d,
      w:  96.6612 + 3.0565E-5 * d,
      a: 19.18171 - 1.55E-8 * d,
      e: 0.047318 + 7.45E-9 * d,
      M: 142.5905 + 0.011725806 * d,
    }),
  },
  {
    label: 'Neptune',
    color: parseColor('#8eb9f3'),
    orbit: (d: number) => ({
      N: 131.7806 + 3.0173E-5 * d,
      i:   1.7700 - 2.55E-7 * d,
      w: 272.8461 - 6.027E-6 * d,
      a: 30.05826 + 3.313E-8 * d,
      e: 0.008606 + 2.15E-9 * d,
      M: 260.2471 + 0.005995147 * d,
    }),
  },
];

// API
export const getBodies = () => BODIES;
export const getPeriod = (orbit: (d: number) => Orbit, d: number) => Math.pow(orbit(d).a, 1.5);

// Ecliptic heliocentric (in degrees)
// (does not include perturbations for Jupiter/Saturn/Uranus)
const π = Math.PI;
const DEGREES_PER_RADIAN = 180 / π;
const sin   = (deg: number) => Math.sin(deg / DEGREES_PER_RADIAN);
const cos   = (deg: number) => Math.cos(deg / DEGREES_PER_RADIAN);
const atan2 = (y: number, x: number) => Math.atan2(y, x) * DEGREES_PER_RADIAN;
const sqrt  = Math.sqrt;

// Emit orbit position
export const emitOrbitPosition = (
  emit: Emit,
  orbit: Orbit,
) => {
  const { N, i, w, a, e, M } = orbit;

  let E = M + e * DEGREES_PER_RADIAN * sin(M) * (1 + e * cos(M));
  E = iterateElement(E, M, e);
  E = iterateElement(E, M, e);
  E = iterateElement(E, M, e);
  E = iterateElement(E, M, e);

  const xv = a * (cos(E) - e);
  const yv = a * (sqrt(1.0 - e * e) * sin(E));
  const v  = atan2(yv, xv);
  const r  = sqrt(xv * xv + yv * yv);

  const xh = r * (cos(N) * cos(v + w) - sin(N) * sin(v + w) * cos(i));
  const yh = r * (sin(N) * cos(v + w) + cos(N) * sin(v + w) * cos(i));
  const zh = r * (sin(v + w) * sin(i));

  emit(xh, yh, zh, 1);
};

// Position solver iteration
const iterateElement = (E: number, M: number, e: number) => {
  return E - (E - e * DEGREES_PER_RADIAN * sin(E) - M) / (1 - e * cos(E));
};
