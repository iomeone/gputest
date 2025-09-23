import  { ParsedBundle, ParsedModule } from '../types';

// Parse bundle of imports into main + libs
export const parseBundle = (bundle: ParsedBundle): [ParsedModule, Record<string, ParsedModule>] => {
  if (typeof bundle === 'string') throw new Error("Bundle is a string instead of an object");

  const out = {} as Record<string, ParsedModule>;
  const traverse = (libs: Record<string, ParsedBundle>) => {
    for (let k in libs) {
      const bundle = libs[k];
      if (typeof bundle.module === 'string') throw new Error("Module is a string instead of an object");
      out[k] = bundle.module;
      traverse(bundle.libs);
    }
  };
  traverse(bundle.libs);

  let {module, entry} = bundle;
  if (entry != null) module = {...module, entry};
  return [module, out];
}

// Parse escaped C-style string
export const parseString = (s: string) => s.slice(1, -1).replace(/\\(.)/g, '$1');
