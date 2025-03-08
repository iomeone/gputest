import { ShaderDefine } from '../types';

import { defineConstants, defineEnables, loadModuleWithCache, DEFAULT_CACHE } from './shader';
import { rewriteUsingAST } from './ast';
import { makeLinker, makeLinkCode, makeLinkBundle, makeLinkModule } from '../util/link';
import { WGSL_NATIVE_TYPES } from './constants';

// No preamble
const getPreambles = () => [];

// Allow attribute renaming
const getRenames = (
  defines?: Record<string, ShaderDefine> | null,
) => {
  const rename = new Map<string, string>();
  if (defines) for (const k in defines) if (k[0] === '@') rename.set(k, `${defines[k]}`);
  return rename;
}

const isGlobalType = (t: string) => WGSL_NATIVE_TYPES.has(t.split('<')[0]);

export const linker     = makeLinker(getPreambles, getRenames, defineConstants, defineEnables, rewriteUsingAST, isGlobalType);
export const linkBundle = makeLinkBundle(linker);
export const linkModule = makeLinkModule(linker);
export const linkCode   = makeLinkCode(linker, loadModuleWithCache, DEFAULT_CACHE);
