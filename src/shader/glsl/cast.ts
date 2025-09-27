import { makeCastTo, parseSwizzle, CastTo } from '../util/cast';
import { bundleToAttribute } from './shader';

const arg = (x: number) => String.fromCharCode(97 + x);

const literal = (v: number, neg: boolean, isFloat: boolean) => {
  if (neg) v = -v;
  if (isFloat) {
    let s = v.toString();
    if (!s.match(/[.eE]/)) s = s + '.0';
    return s;
  }
  return Math.round(v).toString();
};

export const makeCastAccessor = (
  name: string,
  accessor: string,
  args: string[],
  from: string,
  to: string,
  swizzle: string | CastTo,
) => {
  const symbols = args.map((t, i) => `${arg(i)}`);

  const ret = makeSwizzle(from, to, swizzle, 'v');

  return `${to} ${name}(${symbols.map((s, i) => `${args[i]} ${s}`).join(', ')}) {
  ${to} v = ${accessor}(${symbols.join(', ')});
  return ${ret};
}
`;
}

export const makeSwizzle = (
  from: string,
  to: string,
  swizzle: string | CastTo,
  name: string,
) => {
  const isFloat = !!from.match(/^(float|vec2|vec3|vec4|double|dvec2|dvec3|dvec4)$/);

  if (typeof swizzle === 'string' && swizzle.match(/^[xyzw]+$/)) {
    return 'v.' + swizzle;
  }

  const {basis, signs, gain} = parseSwizzle(swizzle);
  const out: string[] = basis.split('').map((v, i) => {
    const neg = !!(signs && signs[i] === '-');
    
    if (v.match(/[0-9]/)) return literal(+v, neg, isFloat);
    else return (neg ? '-' : '') + `${name}.${v}`;
  });
  
  let ret = `${to}(${out.join(', ')})`;
  if (gain != null) ret = `${ret} * ${literal(gain, false, isFloat)}`;

  return ret;
}

export const castTo = makeCastTo(makeCastAccessor, bundleToAttribute);
