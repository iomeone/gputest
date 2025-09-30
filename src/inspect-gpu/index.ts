import type { LiveFiber } from '@use-gpu/live';
import type { InspectExtension, InspectAddIns } from '@use-gpu/inspect';

import { renderCanvas } from './canvas';
import { renderGeometry } from './geometry';
import { renderShader } from './shader';
import { renderTargets } from './targets';
import { renderWGSL } from './wgsl';

export const inspectGPU: InspectExtension = (): InspectAddIns => ({
  props: [
    {
      id: 'canvas',
      label: 'Canvas',
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.canvas,
      render: (fiber: LiveFiber<any>) => renderCanvas({fiber}),
    },
    {
      id: 'compute',
      label: 'Compute',
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.compute,
      render: (fiber: LiveFiber<any>) => renderShader({fiber, type: 'compute'}),
    },
    {
      id: 'vertex',
      label: 'Vertex',
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.vertex,
      render: (fiber: LiveFiber<any>) => renderShader({fiber, type: 'vertex'}),
    },
    {
      id: 'fragment',
      label: 'Fragment',
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.fragment,
      render: (fiber: LiveFiber<any>) => renderShader({fiber, type: 'fragment'}),
    },
    {
      id: 'geometry',
      label: 'Geometry',
      enabled: (fiber: LiveFiber<any>) => fiber.__inspect?.render,
      render: (fiber: LiveFiber<any>) => renderGeometry({fiber}),
    },
    {
      id: 'targets',
      label: 'Targets',
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

export default inspectGPU;
