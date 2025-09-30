import { UniformAttribute } from '../../types';
import { makeStructType } from '../../util/operators/struct';

export const makeStructDefinition = (
  name: string,
  fields: UniformAttribute[],
) => {
  return (
`struct ${name} {
  ${fields.map((f) => `${f.name}: ${f.format},`).join("\n  ")}
};
`
  );
}

export const structType = makeStructType(makeStructDefinition);
