
import { use, useContext } from '@use-gpu/live';
import { Surface } from './surface';
import { FontContext } from '../providers/font-provider';

export const DebugAtlas = () => {
  const {atlas} = useContext(FontContext);
  const {map, width, height, debugPlacements, debugAnchors, debugValidate} = atlas;  

  const out = [];

  for (const {rect, uv} of debugPlacements()) {
    out.push(
      use(Surface)({
        layout: rect,
        fill: [Math.random() * .5, Math.random() * .5, Math.random(), 0.5],
        stroke: [1, 1, 1, 1],
        border: [1, 1, 1, 1],
      }),
    )
  }

  for (const anchor of debugAnchors()) {
    const {x, y, dx, dy, caret} = anchor;

    const l = x + 8;
    const t = y + 8;
    const r = x + (caret ? dx || 10 : 0) - 8;
    const b = y + (caret ? dy || 10 : 0) - 8;

    out.push(
      use(Surface)({
        layout: [x - 4, y - 4, x + 4, y + 4],
        fill: [0, 0, 0, 0.5],
        stroke: [1, 1, 1, 1],
        border: [2, 2, 2, 2],
      }),
    )

    /*
    if (caret) {
      out.push(
        use(Surface)({
          layout: [Math.min(l, r), Math.min(t, b), Math.max(l, r), Math.max(t, b)],
          fill: [0, 0, 0, 0.5],
          stroke: [1, 0.5, 1, 1],
          border: [2, 2, 2, 2],
        }),
      )
    }
    */

    if (caret) {
      out.push(
        use(Surface)({
          layout: [x + 4, y + 4, x + caret[0] - 4, y + caret[1] - 4],
          fill: [0, 0, 0.05, 0.5],
          stroke: [0, 0.45, 0.95, 1],
          border: [2, 2, 2, 2],
        }),
      )
    }
  }

  for (const anchor of debugValidate()) {
    const {x, y, dx, dy, caret} = anchor;
    out.push(
      use(Surface)({
        layout: [x, y, x + dx, y + dy],
        fill: [1, 0, 0, 0.05],
        stroke: [1, 0, 0, 1],
        border: [5, 5, 5, 5],
      }),
    )
  }
  
  return out;

  /*
  return use(Element)({
    width,
    height,
    image,
  });
  */
};
