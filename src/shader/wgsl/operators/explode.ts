import { UniformAttribute } from '../../types';
import { makeExplode } from '../../util/operators/explode';
import { bundleToAttribute } from '../shader';

export const makeExplodeAccessor = (
  ns: string,
  name: string,
  arg: string,
  source: string,
  fields: UniformAttribute[],
) => {
  return (
    fields.map((f) =>
`fn ${ns}${f.name}(i: ${arg}) -> ${f.format} {
  return ${source}[i].${f.name};
}`
    ).join("\n") + "\n"
  );
}

export const explode = makeExplode(makeExplodeAccessor, bundleToAttribute);
