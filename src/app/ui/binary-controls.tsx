import React, { CSSProperties } from 'react';
import type { LC, LiveElement } from '@use-gpu/live';

import { use, fragment, useCallback, useResource, useState } from '@use-gpu/live';
import { HTML } from '@use-gpu/react';
import { useRouterContext } from '@use-gpu/workbench';

const STYLE: CSSProperties = {
  position: 'absolute',

  left: 0,
  bottom: 0,
  width: '300px',
  padding: '20px',
  background: 'rgba(0, 0, 0, .75)',

  zIndex: 100,
};

const NOTE: CSSProperties = {
  position: 'absolute',

  bottom: '80px',
  left: '50%',
  width: '300px',
  marginLeft: '-150px',

  padding: '20px',
  background: 'rgba(0, 0, 0, .75)',

  zIndex: 100,
  pointerEvents: 'none',
  textAlign: 'center',

  transition: 'opacity 1s ease-out',
};

const DROP_ZONE: CSSProperties = {
  position: 'absolute',

  left: 0,
  top: 0,
  right: 0,
  bottom: 0,

  zIndex: 50,
  pointerEvents: 'none',
};

const DROP_MARKER: CSSProperties = {
  position: 'absolute',

  width: '70%',
  height: '70%',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',

  borderRadius: 40,
  border: '10px dashed #FFFFFF80',
  background: '#FFFFFF40',

  zIndex: 60,
  pointerEvents: 'none',
};

// @ts-ignore
const isDevelopment = process.env.NODE_ENV === 'development';
const base = isDevelopment ? '/' : '/demo/';

type State = {
  mode: number,
  buffer: ArrayBuffer,
  gamma: number,
  transparent: boolean,
};

type BinaryControlsProps = {
  container?: Element | null,
  render?: (state: State) => LiveElement
};

const FILES = [
  { id: 'doom', url: base + "data/doom.bin", name: 'doom.exe' },
  { id: 'quake', url: base + "data/quake.bin", name: 'quake.exe' },
  { id: 'smw', url: base + "data/smw.sfc", name: 'smw.sfc' },
  { id: 'wasm', url: base + "data/use-gpu-text.wasm", name: 'use-gpu-text.wasm' },
];

const MODES = [
  { id: '1', name: 'Histogram' },
  { id: '2', name: 'XYZ' },
];

export const BinaryControls: LC<BinaryControlsProps> = (props: BinaryControlsProps) => {
  const {container, render} = props;

  const [dragging, setDragging] = useState(false);
  const [note, setNote] = useState(true);

  const [fileId, setFileId] = useState('doom');
  const [customFile, setCustomFile] = useState<string | null>(null);

  const [gamma, setGamma] = useState(1);
  const [mode, setMode] = useState(1);
  const [buffer, setBuffer] = useState(() => new ArrayBuffer(1));
  const [transparent, setTransparent] = useState(true);

  const handleDragOver = useCallback((e: any) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: any) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: any) => {
    e.preventDefault();
    if (!e.dataTransfer.files) return;

    const {dataTransfer: {files}} = e;
    const [file] = files;
    if (!file) return;

    const r = new FileReader();
    r.onload = (e) => {
      if (!e.target) return;
      setBuffer(e.target.result as ArrayBuffer);
      setCustomFile(file.name);
    };
    r.readAsArrayBuffer(file);

    setDragging(false);
  }, []);

  useResource((dispose) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    canvas.addEventListener('dragover', handleDragOver);
    canvas.addEventListener('dragleave', handleDragLeave);
    canvas.addEventListener('drop', handleDrop);
    dispose(() => {
      canvas.removeEventListener('dragover', handleDragOver);
      canvas.removeEventListener('dragleave', handleDragLeave);
      canvas.removeEventListener('drop', handleDrop);
    });
  }, []);

  useResource(async (dispose) => {
    if (customFile) return;

    const file = FILES.find(({id}) => fileId == id);
    if (!file) return;

    const {url} = file;
    const buffer = await fetch(url).then(r => r.arrayBuffer());
    setBuffer(buffer);
  }, [fileId, customFile]);

  useResource((dispose) => {
    const timer = setTimeout(() => setNote(false), 10000);
    dispose(() => clearTimeout(timer));
  });

  return fragment([
    render ? render({mode, buffer, gamma, transparent}) : null,
    use(HTML, {
      container,
      style: DROP_ZONE,
      children: (<>
        {dragging ? <div style={DROP_MARKER} /> : null}
      </>)
    }),
    use(HTML, {
      container,
      style: {...NOTE, opacity: note ? 1 : 0},
      children: (<>
        Drag and drop a file to view it
      </>)
    }),
    use(HTML, {
      container,
      style: STYLE,
      children: (<>
        <div>
          <p><b>Consecutive bytes as (X,Y,Z) histogram</b></p>

          <label>Show file:</label>
          <select style={{marginLeft: 20}} value={customFile ?? fileId} onChange={(e) => {
            setCustomFile(null);
            setFileId(e.target.value);
          }}>
            {FILES.map(({id, name}) => <option key={id} value={id}>{name}</option>)}
            {customFile ? <option value={customFile}>{customFile}</option> : null}
          </select>
        </div>
        <div>
          <label>Coloring:</label>
          <select style={{marginLeft: 20}} onChange={(e) => setMode(+e.target.value)}>
            {MODES.map(({id, name}) => <option key={id} value={id}>{name}</option>)}
          </select>
        </div>

        <div style={{display: 'flex', alignItems: 'center', height: 30}}><label>Exposure&nbsp;&nbsp;</label><input type="range" min="0.25" max="4" value={gamma} step={0.01} onChange={(e) => setGamma(parseFloat(e.target.value))} /></div>
        <div>
          <label><input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} /> Translucent</label>
        </div>
      </>)
    }),
  ]);
}
