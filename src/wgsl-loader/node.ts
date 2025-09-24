import { readFileSync } from "fs";
import require_hacker from 'require-hacker';
import { transpileWGSL } from './transpile';

const hook = require_hacker.hook('wgsl', (path) => transpileWGSL(readFileSync(path).toString(), path, false));
