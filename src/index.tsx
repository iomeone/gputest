// import '@babel/polyfill';
// import {main} from './app/main';

// window.onload = main;



import React from './live/jsx';
import { render } from './live';
// import { App } from './app/app';

// window.onload = () => render(<App />);


import { initRustText } from './glyph'; // 路径按你的实际位置改
import { initMikkt } from './vendor/mikkt';
window.onload = () => {
  (async () => {
    try {
      console.log("initMikkt start...");
      await initMikkt();
      console.log("initRustText start...");
      await initRustText();           // 预热 wasm + 实例
      console.log("initRustText end...");

      const { App } = await import('./app/app');
      render(<App />);                // 再渲染 App（里面会用到 RustText）
    } catch (e) {
      console.error('!!!RustText init failed', e);
    //   render(<App />);                // 或者渲染一个降级视图
    }
  })();
};