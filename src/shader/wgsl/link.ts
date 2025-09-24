import { Tree } from '@lezer/common';
import { ShaderDefine } from '../types';

import { defineConstants, loadModule, loadModuleWithCache, DEFAULT_CACHE } from './shader';
import { rewriteUsingAST } from './ast';
import { makeLinkCode, makeLinkBundle, makeLinkModule } from '../util/link';

// No preamble
const getPreambles = () => [];

// Allow attribute renaming
const getRenames = (
  defines?: Record<string, ShaderDefine> | null,
) => {
  const rename = new Map<string, string>();
  if (defines) for (let k in defines) if (k[0] === '@') rename.set(k, `${defines[k]}`);
  return rename;
}

// Link a parsed module with static modules, dynamic links
export const linkModule = makeLinkModule(getPreambles, getRenames, defineConstants, rewriteUsingAST);

// Link a source module with static modules and dynamic links.
export const linkCode = makeLinkCode(loadModuleWithCache, linkModule, DEFAULT_CACHE);

// Link a bundle of parsed module + libs, dynamic links
export const linkBundle = makeLinkBundle(linkModule);
