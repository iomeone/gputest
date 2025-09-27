import React, { render } from '../live';

window.onload = async () => {
  const { App } = await import('./app');
  render(<App />);
}
