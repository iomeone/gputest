import { Atlas } from '@use-gpu/core/types';
import { debug, memo, use, yeet, useContext, useNoContext, useFiber, useMemo } from '@use-gpu/live';
import { TextureSource } from '@use-gpu/core';

import { SDFFontContext, SDF_FONT_ATLAS } from './providers/sdf-font-provider';
import { Surface } from '../layout/shape/surface';
import { CompositeData } from '../data';

type DebugAtlasProps = {
  atlas: Atlas,
  source: TextureSource,
  version: number,
};

export const DebugAtlas = (props: DebugAtlasProps = {}) => {
  let {atlas, source} = props;
  if (!atlas && !source) {
    ({atlas, source} = useContext(SDFFontContext));
  }
  else useNoContext(SDFFontContext);

  return debug(use(DebugAtlasView, {
    atlas,
    source,
    version: atlas.version,
  }));
};

export const DebugAtlasView: LiveComponent<DebugAtlasProps> = memo(({atlas, source}: DebugAtlasProps) => {
  const {map, width, height, debugPlacements, debugSlots, debugValidate} = atlas;  
  const {id} = useFiber();

  const yeets = [];
  const out = [];
  const pos = [] as number[];
  
  let ID = 0;
  const next = () => `${id}-${ID++}`;

  for (const rect of debugPlacements()) {
    yeets.push({
      id: next(),
      rectangle: rect,
      uv: [0, 0, 1, 1],
      fill: [Math.random() * .5, Math.random() * .5, Math.random(), 0.5],
      stroke: [1, 1, 1, 1],
      border: [1, 1, 1, 1],
      count: 1,
      repeat: 0,
    });
    /*
    out.push(
      use(Surface, {
        layout: rect,
        fill: [Math.random() * .5, Math.random() * .5, Math.random(), 0.5],
        stroke: [1, 1, 1, 1],
        border: [1, 1, 1, 1],
      })
    );
    */
  }
  
  const fix = ([l, t, r, b]) => [Math.min(l, r), Math.min(t, b), Math.max(l, r), Math.max(t, b)];

  for (const [l, t, r, b, nearX, nearY, farX, farY, corner] of debugSlots()) {
    out.push(
      use(Surface, {
        layout: [l + 4, t + 4, r - 4, b - 4],
        fill: [0, 0, 0.25, 0.25],
        stroke: [0, 0.45, 0.95, 1],
        border: [2, 2, 2, 2],
      })
    );
    out.push(
      use(Surface, {
        layout: fix([l + 8, t + 8, l + nearX - 8, t + nearY - 8]),
        fill: [0, 0, 0, 0.5],
        stroke: [1, 1, 0.2, 1],
        border: [2, 2, 2, 2],
      })
    );
    out.push(
      use(Surface, {
        layout: fix([l + 6, t + 6, l + farX - 6, t + farY - 6]),
        fill: [0, 0, 0, 0.5],
        stroke: [0.2, 0.5, 1.0, 1],
        border: [2, 2, 2, 2],
      })
    );
  }

  for (const anchor of debugValidate()) {
    const {x, y, dx, dy} = anchor;
    out.push(
      use(Surface, {
        layout: [x, y, x + dx, y + dy],
        fill: [1, 0, 0, 0.05],
        stroke: [1, 0, 0, 1],
        border: [5, 5, 5, 5],
      })
    );
  }

  console.log({
    slots: debugSlots().length,
    placements: debugPlacements().length,
  })  

  for (const rect of debugPlacements()) {
    out.push(
      use(Surface, {
        layout: rect,
        fill: [0, 0, 0, 0],
        stroke: [1, 1, 1, 1],
        border: [1, 1, 1, 1],
      })
    );
  }

  yeets.push({
    id: next(),
    rectangle: [width, 0, 500 + width, 500],
    uv: [0, 0, width, height],
    radius: [0, 0, 0, 0],
    texture: source ?? SDF_FONT_ATLAS,
    fill: [0, 0, 0, 1],
    count: 1,
    repeat: 0,
  });
  
  out.push(yeet(yeets));
  
  return out;
}, 'DebugAtlasView');
