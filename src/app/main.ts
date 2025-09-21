import GLSL from './glsl';

import { makeLanguages } from '../core';
import { mountGPU } from '../webgpu';
import { use, render, formatTree } from '../live';

import { App } from './app';

import 'semantic-ui-css/semantic.min.css'

const ROOT_SELECTOR = '#use-gpu';

export const main = async (): Promise<void> => {

  const glsl = await GLSL();
  const languages = makeLanguages({glsl});

  try {
    const {adapter, device, canvas} = await mountGPU(ROOT_SELECTOR);

    const root = await render(
      use(App)({adapter, device, canvas, languages})
    );
  
  } catch (e: any) {

    // Display exception if no WebGPU support
    console.error(e);
    const div = document.createElement('div');
    div.innerText = e.toString();
    div.className = 'error';
    document.body.insertBefore(div, document.querySelector(ROOT_SELECTOR));

  }
}
