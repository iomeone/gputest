import type { LiveFiber } from '@use-gpu/live';
import type { InspectExtension, InspectAddIns } from '@use-gpu/inspect';

import React from 'react';
import { IconRow, SVGAtom, SVGHighlightElement, SVGNextOpen, SVGDashboard, SVGViewOutput, SVGRaster, SVGCompute } from '@use-gpu/inspect';

import { renderCanvas } from './canvas';
import { renderGeometry } from './geometry';
import { renderShader } from './shader';
import { renderTargets } from './targets';
import { renderWGSL } from './wgsl';

export const inspectGPU: InspectExtension = (): InspectAddIns => ({
  props: [
    {
      id: 'canvas',
      label: <span>Canvas&nbsp;&nbsp;<IconRow><SVGAtom /></IconRow></span>,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.canvas,
      render: (fiber: LiveFiber<any>) => renderCanvas({fiber}),
    },
    {
      id: 'pass',
      label: 'Pass',
      label: <span>Pass&nbsp;&nbsp;<IconRow><SVGNextOpen /></IconRow></span>,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.pass,
      render: (fiber: LiveFiber<any>) => renderShader({fiber, type: 'compute'}),
    },
    {
      id: 'compute',
      label: <span>Compute&nbsp;&nbsp;<IconRow><SVGCompute /></IconRow></span>,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.compute,
      render: (fiber: LiveFiber<any>) => renderShader({fiber, type: 'compute'}),
    },
    {
      id: 'vertex',
      label: <span>Vertex&nbsp;&nbsp;<IconRow><SVGRaster /></IconRow></span>,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.vertex,
      render: (fiber: LiveFiber<any>) => renderShader({fiber, type: 'vertex'}),
    },
    {
      id: 'fragment',
      label: <span>Fragment&nbsp;&nbsp;<IconRow><SVGRaster /></IconRow></span>,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.fragment,
      render: (fiber: LiveFiber<any>) => renderShader({fiber, type: 'fragment'}),
    },
    {
      id: 'geometry',
      label: <span>Geometry&nbsp;&nbsp;<IconRow><SVGHighlightElement /></IconRow></span>,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.render,
      render: (fiber: LiveFiber<any>) => renderGeometry({fiber}),
    },
    {
      id: 'targets',
      label: <span>Targets&nbsp;&nbsp;<IconRow><SVGViewOutput /></IconRow></span>,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.output,
      render: (fiber: LiveFiber<any>) => renderTargets({fiber}),
    },
  ],
  prop: [
    {
      id: 'wgsl',
      enabled: (code: string) => !!code.slice(0, 200).match(/\b(::{|@link|@optional|@export|fn)\b/),
      render: (code: string) => renderWGSL({code}),
    },
  ],
});
