import { ShaderModule, ParsedBundle, ParsedModule, UniformAttribute, RefFlags as RF } from '../../types';
import { loadVirtualModule } from '../shader';
import { toMurmur53, scrambleBits53, mixBits53 } from '../hash';
import { toBundle, getBundleEntry, getBundleHash, getBundleKey, getBundleName } from '../bundle';
import { mergeBindings } from '../bind';

export type BundleToAttribute = (
  bundle: ShaderModule,
) => UniformAttribute;

export type MakeExplodeAccessor = (
  ns: string,
  name: string,
  arg: string,
  source: string,
  fields: UniformAttribute[],
) => string;

const STRUCT_LINK = 'T';
const SOURCE_LINK = 'structStorage';

const EXPLODE_EXTERNALS = [{
  struct: {name: STRUCT_LINK},
  flags: RF.External,
}, {
  variable: {name: SOURCE_LINK},
  flags: RF.External,
}];

const makeDeclaration = (name: string, type: any, parameters: any) => ({
  func: {name, type, parameters},
  flags: RF.Exported,
}) as any;

export const makeExplode = (
  makeExplodeAccessor: MakeExplodeAccessor,
  bundleToAttribute: BundleToAttribute,
) => (
  struct: ShaderModule,
  source: ShaderModule,
): ParsedBundle => {

  const tBundle = toBundle(struct);
  const sBundle = toBundle(source);

  const attribute = bundleToAttribute(tBundle);
  const {format: fields} = attribute;

  const entry = getBundleEntry(source) ?? 'explode';
  if (!Array.isArray(fields)) throw new Error(`Cannot explode non-struct type '${entry}: ${fields}' of ${getBundleName(tBundle)}`);
  if (tBundle.bound?.size) throw new Error(`Cannot explode virtual '${entry}' of ${getBundleName(tBundle)}`);

  const hash = getBundleHash(tBundle) ^ getBundleHash(sBundle);
  const key = getBundleKey(tBundle) ^ getBundleKey(sBundle);

  const symbols = fields.map(({name}) => name);

  const links: Record<string, ParsedBundle> = {[STRUCT_LINK]: tBundle, [SOURCE_LINK]: sBundle};

  const externals = EXPLODE_EXTERNALS;
  const args = attribute.args ?? ['u32'];
  if (args.length > 1) throw new Error(`Cannot explode getter for more than 1 index arg`);

  const code   = `@explode`;
  const rehash = scrambleBits53(mixBits53(toMurmur53(code), hash));
  const rekey  = scrambleBits53(mixBits53(rehash, key));

  const render = (namespace: string, rename: Map<string, string>) => {
    const name = rename.get(entry) ?? entry;
    const source = rename.get(SOURCE_LINK) ?? SOURCE_LINK;

    return makeExplodeAccessor(
      namespace,
      name,
      args[0],
      source,
      fields,
    );
  }

  const exports = fields.map(({name, format}) => makeDeclaration(name, format, args));

  const exploded = loadVirtualModule(
    { render },
    { symbols, exports, externals },
    undefined,
    rehash,
    code,
    rekey,
  );

  const rebound = new Set<ParsedModule>();
  mergeBindings(rebound, tBundle);
  mergeBindings(rebound, sBundle);

  return {
    module: exploded,
    links,
    bound: rebound,
  };
};
