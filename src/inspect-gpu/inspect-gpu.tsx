import type { LiveFiber } from '@use-gpu/live';
import type { InspectExtension, InspectAddIns } from '@use-gpu/inspect';

import React from 'react';
import { FiberTag, SVGAtom, SVGDashboard, SVGNextOpen, SVGViewOutput, SVGRaster, SVGCompute, SVGCamera, SVGData, SVGOther } from '@use-gpu/inspect';

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
      key: 'data',
      label: 'Data',
      icon: <SVGData />,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.data,
      render: (fiber: LiveFiber<any>) => renderShader({fiber, type: ''}),
    },
    {
      key: 'view',
      label: 'View',
      icon: <SVGCamera />,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.view,
      render: (fiber: LiveFiber<any>) => renderShader({fiber, type: ''}),
    },
    {
      key: 'pass',
      label: 'Pass',
      icon: <SVGNextOpen />,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.pass,
      render: (fiber: LiveFiber<any>) => renderShader({fiber, type: ''}),
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
      icon: <SVGOther />,
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.render,
      render: (fiber: LiveFiber<any>) => renderGeometry({fiber}),
    },
    {
      key: 'textures',
      label: 'Textures',
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
      key: FiberTag.Data,
      label: 'Data',
      icon: <SVGData />,
      group: 0,
    },
    {
      key: FiberTag.View,
      label: 'View',
      icon: <SVGCamera />,
      group: 0,
    },
    {
      key: FiberTag.Layout,
      label: 'Layout',
      icon: <SVGDashboard />,
      group: 0,
    },
    {
      key: FiberTag.Compute,
      label: 'Compute',
      icon: <SVGCompute />,
      group: 0,
    },
    {
      key: FiberTag.Raster,
      label: 'Raster',
      icon: <SVGRaster />,
      group: 0,
    },
    {
      key: FiberTag.Texture,
      label: 'Textures',
      icon: <SVGViewOutput />,
      group: 0,
    },
  ],
});
