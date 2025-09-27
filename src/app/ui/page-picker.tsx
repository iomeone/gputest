import React from 'react';
import { PAGES } from '../routes';
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
};

export const makePicker = (container: Element) => ({
  "/": { element: null, exact: true },
  "*": { element: use(PagePicker, container) },
});

export const PagePicker = (container: Element) => {
  const {route: {path}, push} = useRouterContext();
  const handleChange = (e: any) => push(e.target.value);

  const icon = ICON("code");
  const handleCode = () => {
    const route = location.pathname;
    const url = `https://gitlab.com/unconed/use.gpu/-/blob/master/packages/app/src/pages${location.pathname}.tsx`;
    window.open(url);
  };

  return (
    use(HTML, {
      container,
      style: STYLE,
      children: (<div style={{display: 'flex', alignItems: 'center'}}>
        <button className="round" onClick={handleCode}>{icon}</button>
        <div style={{width: 16}} />
        <select onChange={handleChange} value={path}>
          {PAGES.map(({title, path}) => (
            <option key={path} value={path}>{title}</option>
          ))}
        </select>
      </div>)
    })
  );
}
