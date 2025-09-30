import React from 'react';
import { makePages } from '../routes';
import { use } from '@use-gpu/live';
import { HTML } from '@use-gpu/react';
import { useRouterContext } from '@use-gpu/workbench';

const ICON = (s: string) => <span className="m-icon">{s}</span>

const STYLE = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  padding: '20px',
  background: 'rgba(0, 0, 0, .5)',

  zIndex: 100,
};

export const makePicker = (container: Element) => ({
  "/": { element: null, exact: true },
  "*": { element: use(PagePicker, container) },
});

export const PagePicker = (container: Element) => {
  const {route: {path, query}, replace} = useRouterContext();
  const handleChange = (e: any) => replace(e.target.value);

  if ('iframe' in query) return null;

  const icon = ICON("code");
  const handleCode = () => {
    const route = location.pathname;
    const url = `https://gitlab.com/unconed/use.gpu/-/blob/master/packages/app/src/pages${location.pathname.replace(/^\/demo/, '')}.tsx`;
    window.open(url);
  };

  const pages = makePages().filter(p => p.path !== '/');
  const n = pages.length;

  const index = pages.findIndex(page => page.path === path);

  const next = pages[(index + 1) % n];
  const prev = pages[(index + n - 1) % n];

  const handlePrev = () => replace(prev.path);
  const handleNext = () => replace(next.path);

  return (
    use(HTML, {
      container,
      style: STYLE,
      children: (<div style={{display: 'flex', alignItems: 'center'}}>
        <button className="round" onClick={handlePrev} title="Go back">◀︎ Previous</button>
        <button className="round" onClick={handleNext} title="Go forward">Next ▶︎</button>
        <button className="round" onClick={handleCode} title="Show Source Code">{icon} Code</button>
        <div style={{width: 16}} />
        <select onChange={handleChange} value={path}>
          {pages.map(({title, path}) => (
            <option key={path} value={path}>{title}</option>
          ))}
        </select>
      </div>)
    })
  );
}
