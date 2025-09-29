import type { LiveComponent } from '@use-gpu/live';
import type { Atlas, Rectangle } from '@use-gpu/core';

import { debug, memo, use, yeet, useContext, useNoContext, useFiber, useMemo } from '@use-gpu/live';
import { TextureSource } from '@use-gpu/core';
import { useBoundShader, useLambdaSource } from '@use-gpu/workbench';

import { SDFFontContext } from './providers/sdf-font-provider';

import { wgsl } from '@use-gpu/shader/wgsl';

export type DebugAtlasProps = {
  atlas: Atlas,
  source: TextureSource,
  size?: number,
  version: number,
};

export const DebugAtlas: LiveComponent<Partial<DebugAtlasProps> | undefined> = (props: Partial<DebugAtlasProps> = {}) => {
  let {atlas, source, size} = props;
  if (!atlas && !source) {
    let getTexture;
    ({__debug: {atlas, source}} = useContext(SDFFontContext) as any);
  }
  else useNoContext(SDFFontContext);

  return debug(use(DebugAtlasView, {
    atlas: atlas!,
    source: source!,
    version: atlas!.version,
    size,
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

const premultiply = wgsl`
@link fn getTexture(uv: vec2<f32>) -> vec4<f32>;

fn main(uv: vec2<f32>) -> vec4<f32> {
  let c = getTexture(uv);
  return vec4<f32>(pow(c.rgb, vec3<f32>(2.2)) * c.a, c.a);
}
`;

export const DebugAtlasView: LiveComponent<DebugAtlasProps> = memo(({atlas, source, size = 500}: DebugAtlasProps) => {
  const {map, width: w, height: h, debugPlacements, debugSlots, debugValidate, debugUploads} = atlas as any;  
  const {id} = useFiber();

  const yeets = [];
  const pos = [] as number[];
  
  const width = size * w / h;
  const height = size;
  const sx = width / w;
  const sy = height / h;
  const fit = ([l, t, r, b]: Rectangle) => [l * sx, t * sy, r * sx, b * sy];

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

  const boundSource = useLambdaSource(useBoundShader(premultiply, [source]), source);

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

  const aspect = h / w;

  yeets.push({
    id: next(),
    rectangle: [width, 0, width + width, height],
    uv: [0, 0, w, h],
    radius: [0, 0, 0, 0],
    texture: boundSource,
    fill: [0, 0, 0, 1],
    count: 1,
    repeat: 3,
  });
  
  return yeet(yeets);
}, 'DebugAtlasView');
