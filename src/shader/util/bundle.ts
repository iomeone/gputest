import  { ParsedBundle, ParsedModule } from '../types';

// Parse bundle of imports into main + libs
export const parseBundle = (bundle: ParsedBundle): [ParsedModule, Record<string, ParsedModule>] => {
  const out = {} as Record<string, ParsedModule>;
  const traverse = (libs: Record<string, ParsedBundle>) => {
    for (let k in libs) {
      const bundle = libs[k];
      out[k] = bundle.module;
      traverse(bundle.libs);
    }
  };
  traverse(bundle.libs);

  let {module, entry} = bundle;
  if (bundle.entry != null) module = {...module, entry};
  return [module, out];
}

// Parse escaped C-style string
export const parseString = (s: string) => s.slice(1, -1).replace(/\\(.)/g, '$1');
