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

import { getShader } from '../../hooks/useShader';
import { useEnvironmentContext } from '../../providers/environment-provider';
import { useRenderContext } from '../../providers/render-provider';
import { usePassContext } from '../../providers/pass-provider';

import { AMBIENT_LIGHT, DOME_LIGHT, DIRECTIONAL_LIGHT, POINT_LIGHT, HEMI_LIGHT, SPOT_LIGHT } from '../../light/types';
import { SHADOW_PAGE } from './light-data';

import { EnvironmentLightRender } from './environment-light-render';
import { EmissiveLightRender } from './emissive-light-render';
import { FullScreenLightRender } from './full-screen-light-render';
import { PointLightRender } from './point-light-render';

import { getLight } from '../../../wgsl/use/lightwgsl';
import { sampleShadow } from '../../../wgsl/use/shadowwgsl';

import renderVirtualLight from '../../../wgsl/render/vertex/virtual-lightwgsl';
import renderFragmentLight from '../../../wgsl/render/fragment/deferred-lightwgsl';

import { getGBufferSurface } from '../../../wgsl/instance/surface/g-buffer-surfacewgsl';
import { getGBufferSSAOSurface } from '../../../wgsl/instance/surface/g-buffer-ssao-surfacewgsl';
import { sampleSSAO } from '../../../wgsl/use/ssaowgsl';

import { applyLight as applyLightWGSL } from '../../../wgsl/material/lightwgsl';
import { applyPBRMaterial as applyMaterial } from '../../../wgsl/material/pbr-applywgsl';
import { applyPBREnvironment as applyEnvironment } from '../../../wgsl/material/pbr-environmentwgsl';
import { applyDirectionalShadow as applyDirectionalShadowWGSL } from '../../../wgsl/shadow/directionalwgsl';
import { applyPointShadow as applyPointShadowWGSL } from '../../../wgsl/shadow/pointwgsl';
import { applyHemiShadow as applyHemiShadowWGSL } from '../../../wgsl/shadow/hemiwgsl';
import { applySpotShadow as applySpotShadowWGSL } from '../../../wgsl/shadow/spotwgsl';

export type LightRenderProps = {
  lights: Map<number, BoundLight>,
  order: number[],
  subranges: Map<number, [number, number]>,
};

export type LightKindProps = {
  gBuffer: TextureSource[],
  stencil: boolean,
  shadows: boolean,

  lights: Map<number, BoundLight>,

  order: number[],
  start: number,
  end: number,

  getSurface: ShaderModule,
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
  [DOME_LIGHT]: FullScreenLightRender,
  [DIRECTIONAL_LIGHT]: FullScreenLightRender,
  [POINT_LIGHT]: PointLightRender,
  [HEMI_LIGHT]: PointLightRender, // TODO: Make SpotLightRender with cone geometry
  [SPOT_LIGHT]: PointLightRender, // TODO: Make SpotLightRender with cone geometry
} as Record<number, LiveComponent<any>>;

export const LightRender: LiveComponent<LightRenderProps> = memo((props: LightRenderProps) => {
  const {
    lights,
    order,
    subranges,
  } = props;

  const {
    buffers: {gBuffer: [gBuffer], shadow, ssao},
    options: {ssao: ssaoOptions},
  } = usePassContext();
  const {depthStencilState, sources} = gBuffer;

  const environment = useEnvironmentContext();

  const shadows = !!shadow;
  const stencil = !!depthStencilState?.format.match(/stencil/);

  const applyLight = useOne(() => {
    const applyDirectionalShadow = shadows ? bindBundle(applyDirectionalShadowWGSL, {sampleShadow}) : null;
    const applyPointShadow = shadows ? bindBundle(applyPointShadowWGSL, {sampleShadow}) : null;
    const applyHemiShadow = shadows ? bindBundle(applyHemiShadowWGSL, {sampleShadow}) : null;
    const applySpotShadow = shadows ? bindBundle(applySpotShadowWGSL, {sampleShadow}) : null;

    return bindBundle(applyLightWGSL, {
      applyMaterial,
      applyDirectionalShadow,
      applyPointShadow,
      applyHemiShadow,
      applySpotShadow,
    }, {SHADOW_PAGE});
  }, shadows);

  const getSurface = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const getSurface = getShader(getGBufferSurface, sources!);
    return ssao && ssaoOptions ? getShader(getGBufferSSAOSurface, [getSurface, sampleSSAO, ssaoOptions.opacity, ssaoOptions.indirect]) : getSurface;
  }, [sources, ssao, ssaoOptions]);

  const out = [...subranges.keys()].map(kind => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [start, end] = subranges.get(kind)!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const props = {lights, order, start, end, stencil, gBuffer: sources!, getSurface, getLight, applyLight};

    const Component = LIGHT_RENDERERS[kind];
    return Component ? keyed(Component, kind, props) : null;
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  out.push(keyed(EmissiveLightRender, -1, {gBuffer: sources!, getLight}));

  if (environment) {
    out.push(keyed(EnvironmentLightRender, -2, {
      getSurface,
      getLight,
      environment,
      apply: applyEnvironment,
    }));
  }

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

  const {bindGroups: {color: {layout: globalLayout, key: pipelineKey}}} = usePassContext();

  const vertexShader = renderVirtualLight;
  const fragmentShader = renderFragmentLight;

  const [v, f] = useMemo(() => {
    const v = bindBundle(vertexShader, links);
    const f = links.getFragment ? bindBundle(fragmentShader, links) : null;
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
    pipelineKey,
    pipeline,

    mode,
  });
}
