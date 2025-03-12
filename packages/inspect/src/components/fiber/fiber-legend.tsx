import React, { FC } from 'react';

import { FiberBadge } from './fiber-badge';
import { Muted } from '../layout';
import { IconItem, SVGAtom, SVGHighlightElement, SVGYeet, SVGQuote, SVGDashboard, SVGViewOutput, SVGRaster, SVGCompute } from '../svg';
import { TreeTip, TreeLegend, TreeLegendColumns, TreeLegendGroup, TreeLegendItem } from '../tree/tree-layout';

// Legend at bottom of fiber tree
export const FiberLegend: FC = () => {
  const makeFiber = (name: string) => {
    const f = (() => {}) as any;
    const fiber = {f, id: 0, by: 1} as any;
    f.displayName = name;
    return fiber;
  };

  const fiber = makeFiber(' ');

  return (<>
    <TreeLegend><div>
      <TreeLegendColumns>
        <TreeLegendGroup>
          <TreeLegendItem>
            <FiberBadge
              fiber={fiber}
              staticMount={true}
            />
            <span>Mounted</span>
          </TreeLegendItem>
          <TreeLegendItem>
            <FiberBadge
              fiber={fiber}
              staticPing={true}
            />
            <span>Updated</span>
          </TreeLegendItem>
          <TreeLegendItem>
            <FiberBadge
              fiber={fiber}
              parents={true}
            />
            <span>Rendered By</span>
          </TreeLegendItem>

          <TreeLegendItem>
            <FiberBadge
              fiber={fiber}
              depends={true}
            />
            <span>Dependency</span>
          </TreeLegendItem>
          <TreeLegendItem>
            <FiberBadge
              fiber={fiber}
              quoted={true}
            />
            <span>Portal</span>
          </TreeLegendItem>
        </TreeLegendGroup>

        <TreeLegendGroup>

          <TreeLegendItem>
            <IconItem gap={-5} top={-2}><SVGYeet /></IconItem>
            <span>Yeet</span>
          </TreeLegendItem>

          <TreeLegendItem>
            <IconItem gap={-5} top={-2}><SVGQuote /></IconItem>
            <span>Quote</span>
          </TreeLegendItem>

          <TreeLegendItem>
            <IconItem gap={-5} top={-2}><SVGDashboard /></IconItem>
            <span>Layout</span>
          </TreeLegendItem>

          <TreeLegendItem>
            <IconItem gap={-5} top={-2}><SVGAtom /></IconItem>
            <span>React</span>
          </TreeLegendItem>
        </TreeLegendGroup>

        <TreeLegendGroup>
          <TreeLegendItem>
            <IconItem gap={-5} top={-2}><SVGHighlightElement /></IconItem>
            <span>Highlight</span>
          </TreeLegendItem>

          <TreeLegendItem>
            <IconItem gap={-5} top={-2}><SVGCompute /></IconItem>
            <span>Compute</span>
          </TreeLegendItem>

          <TreeLegendItem>
            <IconItem gap={-5} top={-2}><SVGRaster /></IconItem>
            <span>Raster</span>
          </TreeLegendItem>

          <TreeLegendItem>
            <IconItem gap={-5} top={-2}><SVGViewOutput /></IconItem>
            <span>Output</span>
          </TreeLegendItem>
        </TreeLegendGroup>
      </TreeLegendColumns>
      <TreeTip><Muted>Double click to focus a sub-tree</Muted></TreeTip>
    </div></TreeLegend>
  </>)
};
