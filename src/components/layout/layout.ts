import { LiveComponent, LiveElement } from '@use-gpu/live/types';
import { LayoutElement, Point } from './types';

import { memo, yeet, resume, provide, gather, useContext, useMemo } from '@use-gpu/live';
import { LayoutContext } from '../providers/layout-provider';

export type LayoutProps = {
  render?: () => LiveElement<any>,
  children?: LiveElement<any>,
};

export const Layout: LiveComponent<LayoutProps> = memo((props: LayoutProps) => {
  const {render, children} = props;
  return gather(children ?? (render ? render() : null), Resume);
}, 'Layout');

const Resume = resume((els: LayoutElement[]) => {
  const layout = useContext(LayoutContext);
  const [left, top, right, bottom] = layout;
  const size = [right - left, bottom - top] as Point;

  const out = [] as LiveElement[];
  for (const {margin, fit} of els) {
    const {
      size: [w, h],
      render,
    } = fit(size);

    const [ml, mt] = margin;
    const el = render([left + ml, top + mt, left + ml + w, top + mt + h]);

    if (Array.isArray(el)) out.push(...el);
    else if (el) out.push(el);
  }
  
  /*
  let l = 0;
  for (const el of out) if (el) {
    if (typeof el.args[0] === 'object') el.args[0].layer = ++l;
  }
  */

  return out;
});
