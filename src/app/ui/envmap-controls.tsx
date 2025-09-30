import React from 'react';
import type { LC, LiveElement } from '../../live';
import type { TextureSource, VectorLike } from '../../core';

import { use, fragment, useState } from '../../live';
import { HTML } from '../../react';
import { ImageTexture, ImageCubeTexture, PanoramaMap } from '../../workbench';

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

type Tonemap = 'aces' | 'hable' | 'unreal' | 'linear';

type EnvMapRenderProps = {
  tonemap: Tonemap,
  preset: string,
  map: any,
  seamFix: boolean,
  debugGrid: boolean,
  model: string,
  position: VectorLike,
  scale: number,
};

type EnvMapControlsProps = {
  hasDebug?: boolean,
  hasModel?: boolean,
  hasTonemap?: boolean,
  container?: Element | null,
  render?: (props: EnvMapRenderProps) => LiveElement,
};

// @ts-ignore
const isDevelopment = process.env.NODE_ENV === 'development';
const base = isDevelopment ? '/' : '/demo/';

const TONEMAPS = [
  {label: "ACES", value: 'aces'},
  {label: "Hable/Uncharted2", value: 'hable'},
  {label: "Unreal3", value: 'unreal'},
  {label: "Linear (none)", value: 'linear'},
] as {label: string, value: Tonemap}[];

const MODELS = [
  {label: "Damaged Helmet", value: base + "gltf/DamagedHelmet/DamagedHelmet.gltf", position: [0, 0, 0], scale: 1},
  {label: "Antique Camera", value: base + "gltf/AntiqueCamera/AntiqueCamera.glb", position: [0, -3, 0], scale: 0.5},
  {label: "Glam Velvet Sofa", value: base + "gltf/GlamVelvetSofa/GlamVelvetSofa.glb", position: [0, -0.7, 0], scale: 1.2},
];

const DEFAULT_MODEL = MODELS[0];

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
  const {hasDebug, hasModel, hasTonemap, container, render} = props;

  const [position, setPosition] = useState(DEFAULT_MODEL.position);
  const [scale, setScale] = useState(DEFAULT_MODEL.scale);
  const [model, setModel] = useState(DEFAULT_MODEL.value);

  const [tonemap, setTonemap] = useState<Tonemap>('aces');
  const [preset, setPreset] = useState('park');
  const [approximate, setApproximate] = useState(false);
  const [seamFix, setSeamFix] = useState(true);
  const [debugGrid, setDebugGrid] = useState(false);

  return fragment([
    render ? render({
      tonemap,
      preset,
      map: approximate ? null : ENVIRONMENTS[preset],
      seamFix,
      debugGrid,
      model,
      position,
      scale,
    }) : null,
    use(HTML, {
      container,
      style: STYLE,
      children: (<>
        {hasModel ? (<div>
          Model
          <select value={model} onChange={(e) => {
            const m = e.target.value;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const model = MODELS.find(model => model.value === m)!;
            setModel(m);
            setPosition(model.position);
            setScale(model.scale);
          }}>
            {MODELS.map(({label, value}) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>) : null}
        {hasTonemap ? (<div>
          Tonemap
          <select value={tonemap} onChange={(e) => {
            const m = e.target.value;
            setTonemap(m as Tonemap);
          }}>
            {TONEMAPS.map(({label, value}) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>) : null}
        <div>
          Environment Map
          <select value={preset} onChange={(e) => setPreset(e.target.value)}>
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
