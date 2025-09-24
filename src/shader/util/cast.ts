import { UniformAttribute, ShaderModule, ParsedBundle } from '../types';
import { loadVirtualModule } from '../util/shader';
import { getProgramHash } from '../util/hash';
import { toBundle } from '../util/bundle';
import { PREFIX_CAST } from '../constants';

const NO_SYMBOLS = [] as string[];

export type MakeCastAccessor = (
  name: string,
  accessor: string,
  args: string[],
  from: string,
  to: string,
  swizzle: string,
) => string;

export const makeCastTo = (
  makeCastAccessor: MakeCastAccessor,
) => (
  bundle: ShaderModule,
  type: string,
  swizzle: string,
): ParsedBundle => {
  const {module, virtual} = toBundle(bundle);
  const {name, format, args} = bundleToAttribute(bundle);

  const {table: {hash}} = module;
  const rehash = getProgramHash(`#cast [${name} ${format}] ${hash}`);
  const symbols = ['cast', 'getValue'];
  const namespace = `${PREFIX_CAST}${rehash.slice(0, 6)}`;

  const imported = {
    at: 0,
    symbols: NO_SYMBOLS,
    name: namespace,
    imports: [{name: 'getValue', imported: name}],
  };
  const modules = [imported];

  // Code generator
  const render = (namespace: string, rename: Map<string, string>) => {
    const name = rename.get('cast') ?? 'cast';
    const accessor = rename.get('getValue') ?? 'getValue';
    return makeCastAccessor(name, accessor, args ?? [], format, type, swizzle);
  }

  const cast = loadVirtualModule(
    { render },
    { symbols, modules },
    'cast',
    rehash,
  );

  const revirtual = module.virtual
    ? (virtual ? [...virtual, module] : [module])
    : virtual;

  return {module: cast, libs: {[namespace]: bundle}, virtual: revirtual};
}

export const bundleToAttribute = (
  bundle: ShaderModule,
  name?: string,
): UniformAttribute => {
  // @ts-ignore
  const module = bundle.module ?? bundle;
  const {table: {declarations}} = module;

  const entry = bundle.entry ?? module.entry ?? name;

  for (const fn of declarations) if (fn.func) {
    const {func} = fn;
    const {type, name, parameters} = func;
    if (name === entry) {
      return {name, format: type.name, args: parameters};
    }
  }

  return {name: name ?? 'main', format: 'void', args: []};
}
