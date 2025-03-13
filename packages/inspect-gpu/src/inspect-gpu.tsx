import type { LiveFiber } from '@use-gpu/live';
import type { InspectExtension, InspectAddIns } from '@use-gpu/inspect';

import React from 'react';
import { FiberTag, IconItem, SVGAtom, SVGDashboard, SVGHighlightElement, SVGNextOpen, SVGViewOutput, SVGRaster, SVGCompute } from '@use-gpu/inspect';

import { renderCanvas } from './canvas';
import { renderGeometry } from './geometry';
import { renderShader } from './shader';
import { renderTargets } from './targets';
import { renderWGSL } from './wgsl';

export const inspectGPU: InspectExtension = (): InspectAddIns => ({
  props: [
    {
      key: 'canvas',
      label: 'Canvas',
      icon: <SVGAtom />,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.canvas,
      render: (fiber: LiveFiber<any>) => renderCanvas({fiber}),
    },
    {
      key: 'pass',
      label: 'Pass',
      icon: <SVGNextOpen />,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.pass,
      render: (fiber: LiveFiber<any>) => renderShader({fiber, type: 'compute'}),
    },
    {
      key: 'compute',
      label: 'Compute',
      icon: <SVGCompute />,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.compute,
      render: (fiber: LiveFiber<any>) => renderShader({fiber, type: 'compute'}),
    },
    {
      key: 'vertex',
      label: 'Vertex',
      icon: <SVGRaster />,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.vertex,
      render: (fiber: LiveFiber<any>) => renderShader({fiber, type: 'vertex'}),
    },
    {
      key: 'fragment',
      label: 'Fragment',
      icon: <SVGRaster />,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.fragment,
      render: (fiber: LiveFiber<any>) => renderShader({fiber, type: 'fragment'}),
    },
    {
      key: 'geometry',
      label: 'Geometry',
      icon: <SVGHighlightElement />,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.render,
      render: (fiber: LiveFiber<any>) => renderGeometry({fiber}),
    },
    {
      key: 'targets',
      label: 'Targets',
      icon: <SVGViewOutput />,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.output,
      render: (fiber: LiveFiber<any>) => renderTargets({fiber}),
    },
  ],
  prop: [
    {
      key: 'wgsl',
      enabled: (code: string) => !!code.slice(0, 200).match(/\b(::{|@link|@optional|@export|fn)\b/),
      render: (code: string) => renderWGSL({code}),
    },
  ],
  filters: [
    {
      key: FiberTag.Layout,
      label: 'Layout',
      icon: <SVGDashboard />,
    },
    {
      key: FiberTag.Compute,
      label: 'Compute',
      icon: <SVGCompute />,
    },
    {
      key: FiberTag.Raster,
      label: 'Raster',
      icon: <SVGRaster />,
    },
    {
      key: FiberTag.Output,
      label: 'Output',
      icon: <SVGViewOutput />,
    },
  ],
});
