import { ParsedBundle, UniformAttribute, RefFlags as RF } from '../../types';
import { loadVirtualModule } from '../shader';
import { toMurmur53 } from '../hash';
import { flattenFormat } from '../format';

export type MakeStructDefinition = (
  name: string,
  fields: UniformAttribute[],
) => string;

export const makeStructType = (
  makeStructDefinition: MakeStructDefinition,
) => (
  fields: UniformAttribute[],
  name?: string,
): ParsedBundle => {

  const entry = name ?? 'struct';
  const symbols = [entry];

  const readable = fields.map(({name}) => name).join(' ');
  const types = fields.map(({format, type}) => flattenFormat(format, type)).join(' ');

  const unique = `@struct [${name ?? ''}] [${readable}] [${types}]`;
  const code   = `@struct ${name ?? ''}`;
  const hash   = toMurmur53(unique);
  const key    = hash;

  const render = (namespace: string, rename: Map<string, string>) => {
    const name = rename.get(entry) ?? entry;

    return makeStructDefinition(
      name,
      fields,
    );
  }

  const exports = [{
    format: fields,
    struct: {
      name: entry,
      type: {name: entry},
    },
    flags: RF.Exported,
  }];

  const virtual = loadVirtualModule(
    { render },
    { symbols, exports },
    entry,
    hash,
    code,
    key,
  );

  return {
    module: virtual,
  };
};
