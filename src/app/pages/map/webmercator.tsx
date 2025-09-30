import type { LC, PropsWithChildren } from '../../../live';

import React from '../../../live';

import {
  Pass,
  OrbitCamera,
  LinearRGB,
} from '../../../workbench';
import {
  Cursor,
  OrbitControls,
} from '../../../interact';
import {
  Transform,
} from '../../../plot';
import {
  MVTiles, MVTStyles, MapboxProvider, MapTileProvider,
  distanceLODStrategy,
} from '../../../map';
import { parseColor } from '../../../parse';

import { InfoBox } from '../../ui/info-box';

import { vec3 } from 'gl-matrix';

const USE_MAPBOX = false;

const lodStrategy = distanceLODStrategy({
  minLevel: 0,
  maxLevel: 4,
  tile: 512,
  detail: 1,
});

export const styleSheet = {
  water: {
    face: {
      stroke: parseColor('#a0a7ff'),
      fill: parseColor('#30407f'),
      width: 3,
      depth: 0,
      zBias: 3,
    }
  },
  admin: {
    line: {
      color: parseColor('#8087ff'),
      width: 2,
      depth: 0,
      zBias: 2,
    },
  },
  road: {
    line: {
      color: parseColor('#303f7f'),
      width: 2,
      depth: 0,
      zBias: 2,
    },
  },
  background: {
    face: {
      fill: parseColor('#0a0a10'),
      zBias: -300,
    }
  },

  disputed_country: {
    font: null,
    line: null,
    point: null,
  },
  disputed_state: {
    font: null,
    line: null,
    point: null,
  },
  disputed_settlement: {
    font: null,
    line: null,
    point: null,
  },
  disputed_sea: {
    font: null,
    line: null,
    point: null,
  },
  continent: {
    font: null,
    line: null,
    point: null,
  },
  settlement: {
    font: null,
    line: null,
    point: null,
  },
  landform: {
    font: null,
    line: null,
    point: null,
  },
  wetland: {
    font: null,
    line: null,
    point: null,
  },
  glacier: {
    font: null,
    line: null,
    point: null,
  },
  
  country: {
    font: {
      stroke: parseColor('#000000'),
      fill: parseColor('#ffcf8f'),
      size: 8,
      outline: 8/8,
      zBias: 30,
      depth: 0.05,
    },
    point: null,
  },
  state: {
    font: {
      stroke: parseColor('#000000'),
      fill: parseColor('#ffff8f'),
      size: 4,
      outline: 4/8,
      zBias: 30,
      depth: 0.05,
    },
    point: null,
  },

  ocean: {
    font: {
      stroke: parseColor('#000000'),
      fill: parseColor('#4fbfff'),
      size: 12,
      outline: 12/8,
      zBias: 30,
      depth: 0.05,
    },
    line: null,
    point: null,
  },
  sea: {
    font: {
      stroke: parseColor('#000000'),
      fill: parseColor('#3fafff'),
      size: 12,
      outline: 12/8,
      zBias: 30,
      depth: 0.05,
    },
    line: null,
    point: null,
  },
};

// @ts-ignore
const isDevelopment = process.env.NODE_ENV === 'development';

// @ts-ignore
const accessToken = process.env.MAPBOX_TOKEN;

export const MapWebMercatorPage: LC = () => {

  const base = isDevelopment ? '/' : '/demo/';
  const url = base + "tiles/{zoom}-{x}-{y}.mvt";

  return (<>
    <InfoBox>Render MVT vector tiles in a Web Mercator projection using the map package.</InfoBox>
    <Cursor cursor='move' />
    <LinearRGB>
      <Camera>
        <Pass>

              <Transform rotation={[-90, 0, 0]}>
                <MVTStyles styles={styleSheet}>
                  {USE_MAPBOX ? (
                    <MapboxProvider accessToken={accessToken}>
                      <MVTiles strategy={lodStrategy} flipY locale="en" />
                    </MapboxProvider>
                  ) : (
                    <MapTileProvider url={url}>
                      <MVTiles strategy={lodStrategy} flipY locale="en" />
                    </MapTileProvider>
                  )}
                </MVTStyles>
              </Transform>

        </Pass>
      </Camera>
    </LinearRGB>
  </>);
};

const Camera = ({children}: PropsWithChildren<object>) => (
  <OrbitControls
    radius={0.5}
    bearing={0.5}
    pitch={0.6}
    minPitch={0.1}
    render={(radius: number, phi: number, theta: number, target: vec3) =>
      <OrbitCamera
        radius={radius}
        phi={phi}
        theta={theta}
        target={[target[0], 0, target[2]]}
      >
        {children}
      </OrbitCamera>
    }
  />
);
