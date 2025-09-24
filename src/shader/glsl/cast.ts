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
  return `${to} ${name}(${symbols.map((s, i) => `${args[i]} ${s}`).join(', ')}) {
  return ${accessor}(${symbols.join(', ')}).${swizzle};
}
`;
}

export const castTo = makeCastTo(makeCastAccessor);
