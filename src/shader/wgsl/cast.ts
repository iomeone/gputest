import { makeCastTo } from '../util/cast';

export { bundleToAttribute } from '../util/cast';

const arg = (x: number) => String.fromCharCode(97 + x);

export const makeCastAccessor = (
  name: string,
  accessor: string,
  args: string[],
  from: string,
  to: string,
  swizzle: string,
) => {
  const symbols = args.map((t, i) => `${arg(i)}`);

  if (from.match(/vec/)) {
    return `fn ${name}(${symbols.map((s, i) => `${s}: ${args[i]}`).join(', ')}) -> ${to} {
  return ${accessor}(${symbols.join(', ')}).${swizzle};
}
`;
  }
  else {
    // Scalar swizzle unsupported in WGSL
    return `fn ${name}(${symbols.map((s, i) => `${s}: ${args[i]}`).join(', ')}) -> ${to} {
  let v = ${accessor}(${symbols.join(', ')});
  return ${to}(${swizzle.split('').map(_ => 'v').join(', ')});
}
`;   
  }
}

export const castTo = makeCastTo(makeCastAccessor);
