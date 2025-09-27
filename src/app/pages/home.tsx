import { LiveComponent } from '@use-gpu/live/types';
import { use } from '@use-gpu/live';
import { HTML } from '@use-gpu/react';
import { useRouterContext } from '@use-gpu/components';

import React from 'react';
import { styled } from '@stitches/react';

import { PAGES } from '../routes';

export const Title = styled('h1', {
  margin: 0,
  padding: '10px 20px',
  textAlign: 'center',
  fontSize: '24px',
  lineHeight: '48px',
});

export type HomePageProps = {
  container: HTMLElement,
};

const PANEL_STYLE = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  width: '400px',
  height: '500px',
  marginLeft: '-200px',
  marginTop: '-250px',
  background: 'rgba(0, 0, 0, .75)',
  zIndex: 1,
};

export const HomePage: LiveComponent<HomePageProps> = (props) => {
  const {container} = props;
  const {linkTo} = useRouterContext();

  return (
    use(HTML, {
      container,
      style: PANEL_STYLE,
      children: (<>
        <Title>Use.GPU Prototype</Title>
        
        <ul>
          {PAGES.slice(0, -1).map(({title, path}) => (
            <li>
              <a key={path} {...linkTo(path)}>{title}</a>
            </li>
          ))}
        </ul>
      </>)
    })
  );
};
