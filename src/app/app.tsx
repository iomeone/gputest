import { LiveComponent } from '@use-gpu/live/types';
import { CanvasRenderingContextGPU } from '@use-gpu/webgpu/types';
import { DataField, Emitter, StorageSource, ViewUniforms, UniformAttribute, RenderPassMode } from '@use-gpu/core/types';

import React from '@use-gpu/live/jsx';
import { FC, useFiber, useResource, useState } from '@use-gpu/live';

import {
  AutoCanvas, CanvasPicking,
  Loop, Draw, Pass,
  CompositeData, Data, RawData,
  FontLoader,
  OrbitCamera, OrbitControls,
  Pick,
  Cursor, Points, Lines,
  RawQuads as Quads, RawLines,
  RenderToTexture,
  Router, Routes,
  TextProvider,
  ViewProvider,
  WebGPU,
} from '@use-gpu/components';
import { UseInspect } from '@use-gpu/inspect';

import { makeRoutes } from './routes';
import { makePicker } from './pages/page-picker';

import { FALLBACK_MESSAGE } from './fallback';

export const App: FC = () => {
  
  const root = document.querySelector('#use-gpu');

  const router = (
    <Router>
      <Routes routes={makeRoutes()} />
      <Routes routes={makePicker(root)} />
    </Router>
  );
  
  const fonts = [
    {
      family: 'Lato',
      weight: 400,
      style: 'normal',
      src: '/Lato-Regular.ttf',
    },
    {
      family: 'Lato',
      weight: 400,
      style: 'italic',
      src: '/Lato-Italic.ttf',
    },
    {
      family: 'Lato',
      weight: 500,
      style: 'normal',
      src: '/Lato-Bold.ttf',
    },
  ];

  const fiber = useFiber();
  const inspect = useInspector();

  return (
    <WebGPU
      fallback={FALLBACK_MESSAGE}
    >
      <AutoCanvas
        selector={'#use-gpu'}
        samples={4}
      >
        <FontLoader fonts={fonts}>
          {router}
        </FontLoader>
      </AutoCanvas>
      {inspect ? <UseInspect fiber={fiber} container={root} /> : null}
    </WebGPU>
  );
};

// Toggle inspector with ctrl/cmd-I.
// Trigger re-render with ctrl/cmd-J.
const useInspector = () => {
  const [version, setVersion] = useState<number>(0);
  const [inspect, setInspect] = useState<boolean>(true);

  useResource((dispose) => {
    const keydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') setInspect((s) => !s);
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') setVersion((s) => s + 1);
    }

    window.addEventListener('keydown', keydown);
    dispose(() => window.addEventListener('keydown', keydown));
  });

  return inspect;
}
