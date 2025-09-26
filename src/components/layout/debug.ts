
import { use, useContext } from '@use-gpu/live';
import { UI } from './ui';
import { Surface } from './surface';
import { CompositeData } from '../data';
import { Lines } from '../layers';
import { FontContext } from '../providers/font-provider';
//import { makeAtlas } from '@use-gpu/core';

export const DebugAtlas = ({texture}) => {
  const {atlas, source} = useContext(FontContext);
  const {map, width, height, debugPlacements, debugSlots, debugValidate} = atlas;  

	/*
    const atlas = makeAtlas(1500, 1500);
    atlas.place(0, 100, 100);
    atlas.place(1, 110, 90);
    atlas.place(2, 75, 120);
    atlas.place(3, 50, 50);
    atlas.place(4, 150, 100);
    atlas.place(5, 250, 100);
    atlas.place(6, 350, 100);
    atlas.place(7, 600, 600);
    atlas.place(8, 140, 100);
    atlas.place(9, 450, 200);
    atlas.place(10, 140, 100);
    atlas.place(11, 140, 100);
    atlas.place(12, 250, 100);
    atlas.place(13, 80, 100);

    for (let i = 0; i < 1; ++i)
      atlas.place(15 + i, 95, 90);
      for (let i = 0; i < 87; ++i)
        atlas.place(50 + i, 85 + (i%4)*5, 85 + (i%3)*15);

    let seed = 0x12345678;
    const rnd = () => {
      const C1 = 0xcc9e2d51;
      const C2 = 0x1b873593;
      seed = ((seed|0) * C1) ^ ((seed|0) * C2) ^ ((seed|0) >>> 16);
      return (seed >>> 0) / 0xffffffff;
    }

    for (let i = 0; i < 28; ++i) atlas.place(200 + i, Math.round(rnd() * 50) + 100, Math.round(rnd() * 50) + 100);

    atlas.flush();
	*/

  const out = [];
  const pos = [] as number[];

  for (const {rect, uv} of debugPlacements()) {
    out.push(
      use(Surface)({
        layout: rect,
        fill: [Math.random() * .5, Math.random() * .5, Math.random(), 0.5],
        stroke: [1, 1, 1, 1],
        border: [1, 1, 1, 1],
      })
    );
  }

  for (const [l, t, r, b, sx, sy, corner] of debugSlots()) {
    out.push(
      use(Surface)({
        layout: [l + 4, t + 4, r - 4, b - 4],
        fill: [0, 0, 0.25, 0.25],
        stroke: [0, 0.45, 0.95, 1],
        border: [2, 2, 2, 2],
      })
    );
    out.push(
      use(Surface)({
        layout: [l + 8, t + 8, l + sx - 8, t + sy - 8],
        fill: [0, 0, 0, 0.5],
        stroke: [1, 0.5, 1, 1],
        border: [2, 2, 2, 2],
      })
    );
  }

  for (const anchor of debugValidate()) {
    const {x, y, dx, dy} = anchor;
    out.push(
      use(Surface)({
        layout: [x, y, x + dx, y + dy],
        fill: [1, 0, 0, 0.05],
        stroke: [1, 0, 0, 1],
        border: [5, 5, 5, 5],
      })
    );
  }
  
  for (const {rect, uv} of debugPlacements()) {
    out.push(
      use(Surface)({
        layout: rect,
        fill: [0, 0, 0, 0],
        stroke: [1, 1, 1, 1],
        border: [1, 1, 1, 1],
      })
    );
  }

  out.push(
    use(Surface)({
      layout: [width, 0, 500 + width, 500],
      image: {
        texture: source,
        fit: 'contain',
      },
      fill: [0.5, 0.5, 0.5, 1],
      stroke: [1, 1, 1, 1],
      border: [1, 1, 1, 1],
    })
  );

  return [
    use(UI)({ children: out }),
  ];
};
