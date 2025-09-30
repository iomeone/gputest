import { ShaderModule, ParsedBundle, ParsedModule, UniformAttribute, RefFlags as RF } from '../../types';
import { loadVirtualModule } from '../shader';
import { toMurmur53, scrambleBits53, mixBits53 } from '../hash';
import { toBundle, getBundleHash, getBundleKey } from '../bundle';
import { formatFormat } from '../format';
import { mergeBindings } from '../bind';

export type BundleToAttribute = (
  bundle: ShaderModule,
) => UniformAttribute;

export type MakeInstancedAccessor = (
  ns: string,
  name: string,
  args: string,
  fields: UniformAttribute[],
  valueAccessors: string[],
  indexAccessor: string | null,
) => string;

const INDEX_ENTRY = 'loadIndex';
const INDEX_LINK = 'getInstanced';
const INDEX_SYMBOLS = [INDEX_ENTRY, INDEX_LINK];
const INDEX_EXTERNALS = [{
  func: {name: INDEX_LINK},
  flags: RF.External,
}];

const makeDeclarations = (name: string, type: any, parameters: any) => [{
  func: {name, type, parameters},
  flags: RF.Exported,
}] as any[];

export const makeInstanceWith = (
  makeInstancedAccessor: MakeInstancedAccessor,
  bundleToAttribute: BundleToAttribute,
) => (
  values: ShaderModule[],
  indices?: ShaderModule | null,
): ParsedBundle => {

  const iBundle = indices ? toBundle(indices) : null;
  const i = iBundle ? bundleToAttribute(iBundle) : null;

  const fields: UniformAttribute[] = [];

  let hash = iBundle ? getBundleHash(iBundle) : 0;
  let key = iBundle ? getBundleKey(iBundle) : 0;

  const symbols = [...INDEX_SYMBOLS];
  const externals = [...INDEX_EXTERNALS];
  const links: Record<string, ParsedBundle> = iBundle ? {[INDEX_LINK]: iBundle} : {};

  const entry = INDEX_ENTRY;
  const arg = i?.args?.[0] ?? 'u32';
  const exports = makeDeclarations(entry, 'void', [arg]);

  const rebound = new Set<ParsedModule>();
  if (iBundle) mergeBindings(rebound, iBundle);

  for (const k in values) {
    const value = (values as any)[k];
    const vBundle = toBundle(value);
    const v = bundleToAttribute(vBundle);

    const f = i ? formatFormat(i?.format, i?.type) : 'u32';
    if (v.args?.[0] !== f) {
      throw new Error(`Type Error: ${i?.name ?? ''} -> ${v.name}.\nCannot chain output ${f} to args (${v.args?.join(', ')}).`);
    }

    hash = mixBits53(hash, getBundleHash(vBundle));
    key  = mixBits53(key, getBundleKey(vBundle));

    fields.push(v);
    symbols.push(v.name);
    exports.push({
      func: {name: v.name, type: v.format, parameters: [arg]},
      flags: RF.Exported,
    });
    externals.push({
      func: {name: v.name},
      flags: RF.External,
    });
    links[v.name] = vBundle;

    mergeBindings(rebound, vBundle);
  }

  const code   = `@instanced [${i?.name ?? 'id'} / ${fields.map(f => f.name).join(' ')}]`;
  const rehash = scrambleBits53(mixBits53(toMurmur53(code), hash));
  const rekey  = scrambleBits53(mixBits53(rehash, key));

  const render = (namespace: string, rename: Map<string, string>) => {
    const name = rename.get(entry) ?? entry;

    const valueAccessors = fields.map(f => rename.get(f.name) ?? f.name);
    const indexAccessor = i ? (rename.get(INDEX_LINK) ?? INDEX_LINK ?? null) : null;

    return makeInstancedAccessor(
      namespace,
      name,
      arg,
      fields,
      valueAccessors,
      indexAccessor,
    );
  }

  const instanced = loadVirtualModule(
    { render },
    { symbols, exports, externals },
    entry,
    rehash,
    code,
    rekey,
  );

  return {
    module: instanced,
    links,
    bound: rebound,
  };
};
