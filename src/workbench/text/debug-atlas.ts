import type { LiveComponent } from '@use-gpu/live';
import type { Atlas, Rectangle, TextureSource, LambdaSource } from '@use-gpu/core';

import { memo, use, yeet, useMemo } from '@use-gpu/live';
import { useShader, useLambdaSource } from '@use-gpu/workbench';

import { useFontDebug } from './providers/font-provider';
import { useSDFFontContext, useNoSDFFontContext } from './providers/sdf-font-provider';
import { useLayoutContext } from '../providers/layout-provider';

//LOGGING.fiber = true;

import { wgsl } from '@use-gpu/shader/wgsl';

type UIAggregate = any;

export type DebugAtlasProps = {
  atlas: Atlas,
  source: TextureSource,
  compact?: boolean,
  size?: number,
  dpi?: number,
  version: number,
};

export type DebugAtlasShapeProps = {
  atlas: Atlas,
  source: TextureSource,
  size?: number,
  dpi?: number,
  compact?: boolean,
  left?: number,
  top?: number,
  version: number,
};

export const DebugAtlas: LiveComponent<Partial<DebugAtlasProps> | undefined> = memo((props: Partial<DebugAtlasProps> = {}) => {
  // eslint-disable-next-line prefer-const
  let {atlas, source, size = 500, dpi = 1, compact} = props;

  let sdfFont;
  if (!atlas && !source) {
    sdfFont = useSDFFontContext() as any;
    ({__debug: {atlas, source}} = sdfFont);
  }
  else useNoSDFFontContext();

  useFontDebug();

  if (!atlas) return;

  const {width: w, height: h} = atlas;

  const shape = useMemo(() => ({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    atlas: atlas!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    source: source!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    version: atlas!.version,
    size,
    compact,
    dpi,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  }), [atlas, source, w, h, atlas!.version, size, compact, dpi, sdfFont]);

  const [left, top] = useLayoutContext();

  return useMemo(() => use(DebugAtlasShape, {
    ...shape,
    left,
    top,
  }), [shape, left, top]);
}, 'DebugAtlas');

const premultiply = wgsl`
@optional @link fn getTexture(uv: vec2<f32>) -> vec4<f32> { return vec4<f32>(0.5, 0.5, 0.5, 1.0); };

fn main(uv: vec2<f32>) -> vec4<f32> {
  let c = getTexture(uv);
  return vec4<f32>(pow(c.rgb, vec3<f32>(2.2)) * c.a, c.a);
}
`;

export const DebugAtlasShape: LiveComponent<DebugAtlasShapeProps> = memo((props: DebugAtlasShapeProps) => {
  const {
    atlas,
    source,
    left = 0,
    top = 0,
    size = 500,
    dpi = 1,
    compact,
  } = props;

  const {width: w, height: h, debugPlacements, debugSlots, debugValidate} = atlas as any;

  const yeets: UIAggregate[] = [];

  const width = size;
  const height = size * h / w;
  const sx = width / w;
  const sy = height / h;

  const fit = ([l, t, r, b]: Rectangle): Rectangle => [left + l * sx, top + t * sy, left + r * sx, top + b * sy];
  const inset = ([l, t, r, b]: Rectangle, v: number): Rectangle => [l + v * dpi, t + v * dpi, r - v * dpi, b - v * dpi];

  const border = [dpi, dpi, dpi, dpi];
  const border5 = [5*dpi, 5*dpi, 5*dpi, 5*dpi];

  const boundSource = useLambdaSource(useShader(premultiply, [source]), source);

  const addRectangle = (attributes: any, texture: TextureSource | LambdaSource | null = null) => {
    yeets.push({
      count: 1,
      archetype: 999,
      attributes,
      texture,
    });
  };

  if (source) {
    addRectangle(
      {
        rectangle: [left + (compact ? 0 : width), top, left + width + (compact ? 0 : width), top + height],
        uv: [0, 0, w, h],
        radius: [0, 0, 0, 0],
        fill: [0, 0, 0, 1],
        repeat: 3,
      },
      boundSource
    );
  }

  for (const rect of debugPlacements()) {
    addRectangle(
      {
        rectangle: fit(rect),
        uv: [0, 0, 1, 1],
        fill: [Math.random() * .5, Math.random() * .5, Math.random(), 0.5],
        stroke: [1, 1, 1, 1],
        border,
        repeat: 0,
      },
    );
  }

  for (const [l, t, r, b] of debugSlots()) {
    addRectangle(
      {
        rectangle: inset(fit([l, t, r, b]), 1),
        uv: [0, 0, 1, 1],
        fill: [0, 0, 0.25, 0.25],
        stroke: [0, 0.45, 0.95, 1],
        border,
        repeat: 0,
      },
    );
  }

  for (const [l, t, r, b, nearX, nearY, farX, farY] of debugSlots()) {
    if (l + farX !== r || t + farY !== b)
    addRectangle(
      {
        rectangle: inset(fit([l, t, l + farX, t + farY]), 3),
        uv: [0, 0, 1, 1],
        fill: [0, 0, 0, 0],
        stroke: [0, 0.95, 0.75, 1],
        border,
        repeat: 0,
      },
    );
    addRectangle(
      {
        rectangle: inset(fit([l, t, l + nearX, t + nearY]), 2),
        uv: [0, 0, 1, 1],
        fill: [0, 0, 0, 0],
        stroke: [0, 0.75, 0.95, 1],
        border,
        repeat: 0,
      },
    );
  }

  for (const anchor of debugValidate()) {
    const {x, y, dx, dy} = anchor;
    addRectangle(
      {
        rectangle: fit([x, y, x + dx, y + dy]),
        uv: [0, 0, 1, 1],
        fill: [1, 0, 0, 0.05],
        stroke: [1, 0, 0, 1],
        border: border5,
        repeat: 0,
      },
    );
  }

  for (const rect of debugPlacements()) {
    addRectangle(
      {
        rectangle: fit(rect),
        uv: [0, 0, 1, 1],
        fill: [Math.random() * .5, Math.random() * .5, Math.random(), 0.5],
        stroke: [1, 1, 1, 1],
        border,
        repeat: 0,
      },
    );
  }

  return yeet(yeets);
}, 'DebugAtlasShape');
