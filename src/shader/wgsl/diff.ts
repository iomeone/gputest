import { makeDiffBy } from '../util/diff';
import { bundleToAttribute } from './shader';

const arg = (x: number) => String.fromCharCode(97 + x);

const literal = (v: string | number, isFloat: boolean, isUnsigned: boolean) => {
  if (typeof v === 'string') return v;
  if (isFloat) {
    let s = v.toString();
    if (!s.match(/[.eE]/)) s = s + '.0';
    return s;
  }
  return Math.round(v).toString() + (isUnsigned ? 'u' : '');
};

export const makeDiffAccessor = (
  name: string,
  accessor: string,
  args: string[],
  type: string,
  offsets: (number | string)[],
) => {
  const isFloat = (type: string) => !!type.match(/(^|<)f/);
  const isUnsigned = (type: string) => !!type.match(/(^|<)u/);

  const symbols = args.map((t, i) => `${arg(i)}`);

  return `fn ${name}(${symbols.map((s, i) => `${s}: ${args[i]}`).join(', ')}) -> ${type} {
  ${symbols.map((s, i) => `let d${s} = ${s} + ${literal(offsets[i] ?? 0, isFloat(args[i]), isUnsigned(args[i]))};`)}
  let v1 = ${accessor}(${symbols.join(', ')});
  let v2 = ${accessor}(${symbols.map(s => 'd' + s).join(', ')});
  return v2 - v1;
}
`;
}

export const diffBy = makeDiffBy(makeDiffAccessor, bundleToAttribute);
