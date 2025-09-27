import type { LiveComponent } from '@use-gpu/live';
import type { Atlas, Rectangle } from '@use-gpu/core';

import { debug, memo, use, yeet, useContext, useNoContext, useFiber, useMemo } from '@use-gpu/live';
import { TextureSource } from '@use-gpu/core';

import { SDFFontContext, SDF_FONT_ATLAS } from './providers/sdf-font-provider';

export type DebugAtlasProps = {
  atlas: Atlas,
  source: TextureSource,
  version: number,
};

export const DebugAtlas: LiveComponent<Partial<DebugAtlasProps> | undefined> = (props: Partial<DebugAtlasProps> = {}) => {
  let {atlas, source} = props;
  console.log({props, atlas, source})
  if (!atlas && !source) {
    ({__debug: {atlas, sourceRef: {current: source}}} = useContext(SDFFontContext) as any);
  }
  else useNoContext(SDFFontContext);

  return debug(use(DebugAtlasView, {
    atlas: atlas!,
    source: source!,
    version: atlas!.version,
  }));
};

const COLORS = [
  [0, 1, 1, 1],
  [1, 0, 1, 1],
  [1, 1, 0, 1],
  [0.5, 0.5, 1, 1],
  [0.5, 1, 0.5, 1],
  [1, .5, 0.5, 1],
];

export const DebugAtlasView: LiveComponent<DebugAtlasProps> = memo(({atlas, source}: DebugAtlasProps) => {
  const {map, width: w, height: h, debugPlacements, debugSlots, debugValidate, debugUploads} = atlas as any;  
  const {id} = useFiber();

  const yeets = [];
  const pos = [] as number[];
  
  const width = w / 2;
  const height = h / 2;
  const fit = ([l, t, r, b]: Rectangle) => [l / 2, t / 2, r / 2, b / 2];
  
  let ID = 0;
  const next = () => `${id}-${ID++}`;

  for (const rect of debugPlacements()) {
    yeets.push({
      id: next(),
      rectangle: fit(rect),
      uv: [0, 0, 1, 1],
      fill: [Math.random() * .5, Math.random() * .5, Math.random(), 0.5],
      stroke: [1, 1, 1, 1],
      border: [1, 1, 1, 1],
      count: 1,
      repeat: 0,
    });
  }
  
  const fix = ([l, t, r, b]: Rectangle): Rectangle =>
    [Math.min(l, r), Math.min(t, b), Math.max(l, r), Math.max(t, b)];

  for (const [l, t, r, b, nearX, nearY, farX, farY, corner] of debugSlots()) {
    yeets.push({
      id: next(),
      rectangle: fit([l + 4, t + 4, r - 4, b - 4]),
      uv: [0, 0, 1, 1],
      fill: [0, 0, 0.25, 0.25],
      stroke: [0, 0.45, 0.95, 1],
      border: [2, 2, 2, 2],
      count: 1,
      repeat: 0,
    });
    yeets.push({
      id: next(),
      rectangle: fit(fix([l + 8, t + 8, l + nearX - 8, t + nearY - 8])),
      uv: [0, 0, 1, 1],
      fill: [0, 0, 0, 0.5],
      stroke: [1, 1, 0.2, 1],
      border: [2, 2, 2, 2],
      count: 1,
      repeat: 0,
    });
    yeets.push({
      id: next(),
      rectangle: fit(fix([l + 6, t + 6, l + farX - 6, t + farY - 6])),
      uv: [0, 0, 1, 1],
      fill: [0, 0, 0, 0.5],
      stroke: [0.2, 0.5, 1.0, 1],
      border: [2, 2, 2, 2],
      count: 1,
      repeat: 0,
    });
  }

  for (const anchor of debugValidate()) {
    const {x, y, dx, dy} = anchor;
    yeets.push({
      id: next(),
      rectangle: fit([x, y, x + dx, y + dy]),
      uv: [0, 0, 1, 1],
      fill: [1, 0, 0, 0.05],
      stroke: [1, 0, 0, 1],
      border: [5, 5, 5, 5],
      count: 1,
      repeat: 0,
    });
  }

  for (const rect of debugPlacements()) {
    yeets.push({
      id: next(),
      rectangle: fit(rect),
      uv: [0, 0, 1, 1],
      fill: [Math.random() * .5, Math.random() * .5, Math.random(), 0.5],
      stroke: [1, 1, 1, 1],
      border: [1, 1, 1, 1],
      count: 1,
      repeat: 0,
    });
  }

  yeets.push({
    id: next(),
    rectangle: [width, 0, 500 + width, 500],
    uv: [0, 0, w, h],
    radius: [0, 0, 0, 0],
    texture: source ?? SDF_FONT_ATLAS,
    fill: [0, 0, 0, 1],
    count: 1,
    repeat: 3,
  });
  
  /*
  let i = 0;
  for (const rects of debugUploads()) {
    for (const [l, t, r, b] of rects) {
      yeets.push({
        id: next(),
        rectangle: fit([l + w, t, r + w, b]),
        uv: [0, 0, 1, 1],
        fill: [0, 0, 0, 0],
        stroke: COLORS[i % COLORS.length],
        border: [2, 2, 2, 2],
        count: 1,
        repeat: 0,
      });
    }
    ++i;
  }
  */
  
  return yeet(yeets);
}, 'DebugAtlasView');
