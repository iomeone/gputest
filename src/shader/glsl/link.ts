import { Tree } from '@lezer/common';

import { defineConstants, loadModule, loadModuleWithCache, DEFAULT_CACHE } from './shader';
import { rewriteUsingAST } from './ast';
import { makeLinkCode, makeLinkBundle, makeLinkModule } from '../util/link';

import { GLSL_VERSION } from './constants';

// Override GLSL version/prefix
let PREAMBLE = `#version ${GLSL_VERSION}`;
export const setPreamble = (s: string): string => PREAMBLE = s;
export const getPreamble = (): string => PREAMBLE;
const getPreambles = (): string[] => [getPreamble()];

// No preprocessor renames
const getRenames = () => new Map<string, string>();

// Link a parsed module with static modules, dynamic links
export const linkModule = makeLinkModule(getPreambles, getRenames, defineConstants, rewriteUsingAST);

// Link a source module with static modules and dynamic links.
export const linkCode = makeLinkCode(loadModuleWithCache, linkModule, DEFAULT_CACHE);

// Link a bundle of parsed module + libs, dynamic links
export const linkBundle = makeLinkBundle(linkModule);

