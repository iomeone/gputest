import GLSL from './glsl';

import { mountGPU } from '../webgpu';
import { use, render, formatTree } from '../live';

import { App } from './app';

const ROOT_SELECTOR = '#use-gpu';

export const main = async (): Promise<void> => {
  const compileGLSL = await GLSL();
  try {
    const {adapter, device, canvas} = await mountGPU(ROOT_SELECTOR);

    const root = await render(
      use(App)({adapter, device, canvas, compileGLSL})
    );
  
    // @ts-ignore
    const log = () => console.log(formatTree(root))
    setTimeout(() => log(), 2000);

  } catch (e) {

    // Display exception if no WebGPU support
    console.error(e);
    const div = document.createElement('div');
    div.innerText = e.toString();
    div.className = 'error';
    document.body.insertBefore(div, document.querySelector(ROOT_SELECTOR));

  }
}
