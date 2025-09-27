import { makeChainTo } from '../util/chain';
import { bundleToAttribute } from './shader';

const arg = (x: number) => String.fromCharCode(97 + x);

export const makeChainAccessor = (
  type: TypeLike,
  name: string,
  args: string[],
  from: string,
  to: string,
) => {
  const symbols = args.map((t, i) => `${arg(i)}`);

  return `${type} ${name}(${symbols.map((s, i) => `${args[i]} ${s}`).join(', ')}) {
  return ${to}(${from}(${symbols.join(', ')}));
}
`;   
}

export const chainTo = makeChainTo(makeChainAccessor, bundleToAttribute);
