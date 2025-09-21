import GLSL from './glsl';

import { mountGPU } from '../canvas/mount';
import { defer, render, formatTree } from '../live';

import { App } from './app';

const ROOT_SELECTOR = '#use-gpu';

export const main = async (): Promise<void> => {
  const compileGLSL = await GLSL();
  const {adapter, device, canvas} = await mountGPU(ROOT_SELECTOR);

  const root = await render(
    defer(App)({adapter, device, canvas, compileGLSL})
  );
  
  console.log(formatTree(root))
}
