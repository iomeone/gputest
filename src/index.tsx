// import '@babel/polyfill';
// import {main} from './app/main';

// window.onload = main;



import React from './live/jsx';
import { render } from './live';
import { App } from './app/app';

window.onload = () => render(<App />);
