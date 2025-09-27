import React from 'react';
import { PAGES } from '../routes';
import { use } from '@use-gpu/live';
import { HTML } from '@use-gpu/react';
import { useRouterContext } from '@use-gpu/components';

const STYLE = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  padding: '20px',
  background: 'rgba(0, 0, 0, .5)',
};

export const makePicker = (container: HTMLElement) => ({
  "/": { element: null, exact: true },
  "*": { element: use(PagePicker, container) },
});

export const PagePicker = (container: HTMLElement) => {
  const {route: {path}, push} = useRouterContext();
  const handleChange = (e: any) => push(e.target.value);

  return (
    use(HTML, {
      container,
      style: STYLE,
      children: (
        <select onChange={handleChange} value={path}>
          {PAGES.map(({title, path}) => (
            <option key={path} value={path}>{title}</option>
          ))}
        </select>
      )
    })
  );
}
