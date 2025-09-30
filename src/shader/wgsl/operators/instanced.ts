import { UniformAttribute } from '../../types';
import { makeInstanceWith } from '../../util/operators/instanced';
import { bundleToAttribute } from '../shader';

const arg = (x: number) => String.fromCharCode(97 + x);

export const makeInstancedAccessor = (
  ns: string,
  name: string,
  args: string,
  fields: UniformAttribute[],
  valueAccessors: string[],
  indexAccessor: string | null,
) => {
  return (
`${fields.map((f, i) => `var<private> ${ns}${arg(i)}: ${f.format};`).join("\n")}
fn ${name}(index: ${args}) {
  ${indexAccessor ? `let mapped = ${indexAccessor}(index);\n` : ''}`+
`  ${fields.map((f, i) => `${ns}${arg(i)} = ${valueAccessors[i]}(${indexAccessor ? 'mapped' : 'index'});`).join("\n  ")}
}

${fields.map((f, i) => `fn ${ns}${f.name}(index: ${f.args?.[0] ?? 'u32'}) -> ${f.format} { return ${ns}${arg(i)}; }`).join("\n")}
`
  );
}

export const instanceWith = makeInstanceWith(makeInstancedAccessor, bundleToAttribute);
