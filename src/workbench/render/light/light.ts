import type { LiveComponent } from '../../../live';
import type { ShaderModule } from '../../../shader';
import type { Lazy, TextureSource } from '../../../core';
import type { Update } from '../../../state';
import type { BoundLight } from '../../light/types';

import { memo, yeet, keyed, useMemo, useOne } from '../../../live';
import { BLEND_ADD } from '../../../core';
import { bindBundle } from '../../../shader/wgsl';
import { $delete } from '../../../state';

import { drawCall } from '../../queue/draw-call';

import { useRenderContext } from '../../providers/render-provider';
import { useViewContext } from '../../providers/view-provider';
import { usePassContext } from '../../providers/pass-provider';

import { AMBIENT_LIGHT, DIRECTIONAL_LIGHT, DOME_LIGHT, POINT_LIGHT } from '../../light/types';
import { SHADOW_PAGE } from './light-data';

import { EmissiveLightRender } from './emissive';
import { FullScreenLightRender } from './full-screen';
import { PointLightRender } from './point';

import { getLight } from '../../../wgsl/use/lightwgsl';
import { sampleShadow } from '../../../wgsl/use/shadowwgsl';

import instanceDrawVirtualLight from '../../../wgsl/render/vertex/virtual-lightwgsl';
import instanceFragmentLight from '../../../wgsl/render/fragment/deferred-lightwgsl';

import { applyLight as applyLightWGSL } from '../../../wgsl/material/lightwgsl';
import { applyPBRMaterial as applyMaterial } from '../../../wgsl/material/pbr-applywgsl';
import { applyDirectionalShadow as applyDirectionalShadowWGSL } from '../../../wgsl/shadow/directionalwgsl';
import { applyPointShadow as applyPointShadowWGSL } from '../../../wgsl/shadow/pointwgsl';

export type LightRenderProps = {
  lights: Map<number, BoundLight>,
  order: number[],
  subranges: Map<number, [number, number]>,
};

export type LightKindProps = {
  gbuffer: TextureSource[],
  stencil: boolean,
  shadows: boolean,

  lights: Map<number, BoundLight>,

  order: number[],
  start: number,
  end: number,

  getLight: ShaderModule,
  applyLight: ShaderModule,
};

export const FULLSCREEN_PIPELINE = {
  primitive: {
    cullMode: 'none',
  },
  depthStencil: {
    depthCompare: 'always',
    depthWriteEnabled: false,
  },
  fragment: {
    targets: {
      0: {
        blend: BLEND_ADD,
      },
    },
  },
} as Update<GPURenderPipelineDescriptor>;

export const GEOMETRY_PIPELINE = {
  primitive: {
    cullMode: 'back',
  },
  depthStencil: {
    depthCompare: 'greater-equal',
    depthWriteEnabled: false,
  },
  fragment: {
    targets: {
      0: {
        blend: BLEND_ADD,
      },
    },
  },
} as Update<GPURenderPipelineDescriptor>;

export const STENCIL_PIPELINE = {
  primitive: {
    cullMode: 'front',
  },
  depthStencil: {
    depthCompare: 'less',
    depthWriteEnabled: false,
    stencilBack: {
      compare: 'always',
      passOp: 'increment-clamp',
    },
  },
  fragment: $delete(),
} as Update<GPURenderPipelineDescriptor>;

export const FULLSCREEN_STENCIL_PIPELINE = {
  primitive: {
    cullMode: 'none',
  },
  depthStencil: {
    depthCompare: 'always',
    depthWriteEnabled: false,
    stencilFront: {
      compare: 'less',
    },
  },
  fragment: {
    targets: {
      0: {
        blend: BLEND_ADD,
      },
    },
  },
} as Update<GPURenderPipelineDescriptor>;

export const GEOMETRY_STENCIL_PIPELINE = {
  primitive: {
    cullMode: 'back',
  },
  depthStencil: {
    depthCompare: 'greater',
    depthWriteEnabled: false,
    stencilFront: {
      compare: 'less',
    },
  },
  fragment: {
    targets: {
      0: {
        blend: BLEND_ADD,
      },
    },
  },
} as Update<GPURenderPipelineDescriptor>;

export const FULLSCREEN_DEFS = {
  IS_FULLSCREEN: true,
};

export const GEOMETRY_DEFS = {
  IS_FULLSCREEN: false,
};

const LIGHT_RENDERERS = {
  [AMBIENT_LIGHT]: FullScreenLightRender,
  [DIRECTIONAL_LIGHT]: FullScreenLightRender,
  [DOME_LIGHT]: FullScreenLightRender,
  [POINT_LIGHT]: PointLightRender,
} as Record<number, LiveComponent<any>>;

export const LightRender: LiveComponent<LightRenderProps> = memo((props: LightRenderProps) => {
  const {
    lights,
    order,
    subranges,
  } = props;

  const {buffers: {gbuffer: [gbuffer], shadow: [shadow]}} = usePassContext();
  const {depthStencilState, sources} = gbuffer;

  const shadows = !!shadow;
  const stencil = !!depthStencilState?.format.match(/stencil/);

  const applyLight = useOne(() => {
    const applyDirectionalShadow = shadows ? bindBundle(applyDirectionalShadowWGSL, {sampleShadow}) : null;
    const applyPointShadow = shadows ? bindBundle(applyPointShadowWGSL, {sampleShadow}) : null;

    return bindBundle(applyLightWGSL, {
      applyMaterial,
      applyDirectionalShadow,
      applyPointShadow,
    }, {SHADOW_PAGE});
  }, shadows);

  const out = [...subranges.keys()].map(kind => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [start, end] = subranges.get(kind)!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const props = {lights, order, start, end, stencil, gbuffer: sources!, getLight, applyLight};

    const Component = LIGHT_RENDERERS[kind];
    return Component ? keyed(Component, kind, props) : null;
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  out.push(keyed(EmissiveLightRender, -1, {gbuffer: sources!, getLight}));

  return out;
}, 'LightRender');

export const LightDraw = (
  vertexCount: Lazy<number>,
  instanceCount: Lazy<number>,
  firstInstance: Lazy<number>,
  links: Record<string, ShaderModule | undefined>,
  pipeline?: Update<GPURenderPipelineDescriptor>,
  mode?: string,
) => yeet(useLightDraw(vertexCount, instanceCount, firstInstance, links, pipeline, mode));

export const useLightDraw = (
  vertexCount: Lazy<number>,
  instanceCount: Lazy<number>,
  firstInstance: Lazy<number>,
  links: Record<string, ShaderModule | undefined>,
  pipeline?: Update<GPURenderPipelineDescriptor>,
  mode = 'light',
) => {
  const renderContext = useRenderContext();

  const {layout: globalLayout} = useViewContext();
  const {layout: passLayout} = usePassContext();

  const vertexShader = instanceDrawVirtualLight;
  const fragmentShader = instanceFragmentLight;

  const [v, f] = useMemo(() => {
    const v = bindBundle(vertexShader, links, undefined);
    const f = links.getFragment ? bindBundle(fragmentShader, links, undefined) : null;
    return [v, f];
  }, [vertexShader, fragmentShader, links]);

  return drawCall({
    vertexCount,
    instanceCount,
    firstInstance,

    vertex: v,
    fragment: f,
    renderContext,

    globalLayout,
    passLayout,
    pipeline,

    mode,
  });
}
