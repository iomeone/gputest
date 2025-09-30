import React from 'react';
import type { LC, LiveElement } from '@use-gpu/live';
import type { TextureSource } from '@use-gpu/core';

import { use, fragment, useState } from '@use-gpu/live';
import { HTML } from '@use-gpu/react';
import { ImageTexture, ImageCubeTexture, PanoramaMap, useRouterContext } from '@use-gpu/workbench';

const STYLE = {
  position: 'absolute',

  left: 0,
  //left: '50%',
  //marginLeft: '-100px',

  bottom: 0,
  width: '200px',
  padding: '20px',
  background: 'rgba(0, 0, 0, .75)',
};

type EnvMapControlsProps = {
  hasDebug?: boolean,
  container?: Element | null,
  render?: (mode: string, map: any, seamFix: boolean, debugGrid: boolean) => LiveElement,
};

export const ENVIRONMENTS = {
  park:
    <ImageCubeTexture
      urls={[
        "/textures/cube/park2/px.jpg",
        "/textures/cube/park2/nx.jpg",
        "/textures/cube/park2/py.jpg",
        "/textures/cube/park2/ny.jpg",
        "/textures/cube/park2/pz.jpg",
        "/textures/cube/park2/nz.jpg",
      ]}
      format="jpg"
    />,

  pisa:
    <ImageCubeTexture
      urls={[
        "/textures/cube/pisaRGBM16/px.png",
        "/textures/cube/pisaRGBM16/nx.png",
        "/textures/cube/pisaRGBM16/py.png",
        "/textures/cube/pisaRGBM16/ny.png",
        "/textures/cube/pisaRGBM16/pz.png",
        "/textures/cube/pisaRGBM16/nz.png",
      ]}
      format='rgbm16'
    />,

  road:
    <ImageTexture
      url='/textures/equi/rural_asphalt_road_1k.hdr'
      format='hdr'
    >{
      (texture: TextureSource | null) => <PanoramaMap texture={texture} gain={0.5} />
    }</ImageTexture>,

  field:
    <ImageTexture
      url='/textures/equi/graveyard_pathways_1k.hdr'
      format='hdr'
    >{
      (texture: TextureSource | null) => <PanoramaMap texture={texture} />
    }</ImageTexture>,
} as Record<string, any>;

export const EnvMapControls: LC<EnvMapControlsProps> = (props: EnvMapControlsProps) => {
  const {hasDebug, container, render} = props;
  const [mode, setMode] = useState('park');
  const [approximate, setApproximate] = useState(false);
  const [seamFix, setSeamFix] = useState(true);
  const [debugGrid, setDebugGrid] = useState(false);

  return fragment([
    render ? render(mode, approximate ? null : ENVIRONMENTS[mode], seamFix, debugGrid) : null,
    use(HTML, {
      container,
      style: STYLE,
      children: (<>
        <div>
          Environment Map
          <select onChange={(e) => setMode(e.target.value)}>
            <option value="park">Park</option>
            <option value="pisa">Pisa</option>
            <option value="road">Road</option>
            <option value="field">Field</option>
          </select>
        </div>
        <div>
          <label><input type="checkbox" checked={approximate} onChange={(e) => setApproximate(e.target.checked)} /> Approximate SH</label>
        </div>
        {hasDebug ? (<>
          <div>
            <label><input type="checkbox" checked={seamFix} onChange={(e) => setSeamFix(e.target.checked)} /> Octahedral Seam Fix</label>
          </div>
          <div>
            <label><input type="checkbox" checked={debugGrid} onChange={(e) => setDebugGrid(e.target.checked)} /> Octahedral Grid</label>
          </div>
        </>) : null}
      </>)
    }),
  ]);
}
