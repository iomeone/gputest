import React from 'react';

export const FALLBACK_MESSAGE = (error: Error) => <>
  <div className="error-message">{error.message}</div>
  <div className="help-message">
    <p><b>To enable WebGPU:</b></p>
    <ul>
      <li><b>Chrome</b> – Windows, MacOS, Android, ChromeOS &nbsp; ✅</li>
      <li><b>Safari</b> – macOS, iPadOS, iOS - Technical Preview version required</li>
      <li><b>Firefox</b> – Nightly version required<br />Turn on <code>dom.webgpu.enabled</code> in <code>about:config</code></li>
    </ul>
    <p>Note that WebGPU requires an HTTPS connection if not running on <code>localhost</code>.</p>
    <p>See <a href="https://caniuse.com/webgpu">CanIUse.com</a> for more info.</p>
  </div>
</>;
