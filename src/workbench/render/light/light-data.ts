import type { LiveComponent, LiveElement } from '../../../live';
import type { Atlas, StorageSource, TextureSource, UniformAttribute } from '../../../core';
import type { Light, BoundLight } from '../../light/types';
import type { LightEnv } from '../../pass/types';

import { capture, yeet, makeCapture, useCallback, useCapture, useFiber, useMemo, useOne, useRef, useResource, incrementVersion } from '../../../live';
import {
  makeUniformLayout, makeLayoutData, makeLayoutFiller,
  makeStorageBuffer, uploadBuffer, uploadBufferRange,
  makeAtlas, makeTexture, seq,
} from '../../../core';
import { mixBits53 } from '../../../state';
import { bundleToAttribute } from '../../../shader/wgsl';

import { useDeviceContext } from '../../providers/device-provider';
import { QueueReconciler } from '../../reconcilers/index';
import { useBufferedSize } from '../../hooks/useBufferedSize';

import { Light as WGSLLight } from '../../../wgsl/use/typeswgsl';

import { vec2, vec4 } from 'gl-matrix';

const {signal} = QueueReconciler;

type Queued = {id: number, data: Light};

export const SHADOW_PAGE = 4096;
export const SHADOW_FORMAT = "depth32float";

const LIGHT_ATTRIBUTE = bundleToAttribute(WGSLLight);
const LIGHT_LAYOUT = makeUniformLayout(LIGHT_ATTRIBUTE.format as UniformAttribute[]);

// Reserve space for count
const LIGHT_BYTE_OFFSET = 16;

const makeAtlasPage = () => makeAtlas(
  SHADOW_PAGE,
  SHADOW_PAGE,
  SHADOW_PAGE,
  SHADOW_PAGE,
);

const ATLAS_LABEL = 'ShadowMap Atlas';

export const LightCapture = makeCapture<null>('LightCapture');

export type UseLight = (l: Light) => void;

export type LightDataProps = {
  reserve?: number,
  shadows?: boolean,
  render?: (
    useLight: (l: Light) => void,
  ) => LiveElement,
  then?: (
    lightEnv: LightEnv,
  ) => LiveElement,
};

export const makeLightQueue = () => {
  const queue = [] as Queued[];
  const changed = new Set<number>;

  const lights = new Map<number, BoundLight>;
  const maps = new Map<number, BoundLight>;

  const enqueue = (id: number, light: Light) => {
    queue.push({id, data: light});
    changed.add(id);
  };

  const dispose = (id: number) => {
    lights.delete(id);
    maps.delete(id);
    changed.delete(id);
  };

  const flush = () => {
    // Update light data in-place
    for (const {id, data} of queue) {
      const {shadow} = data;

      let d = lights.get(id);
      if (d) {
        Object.assign(d, data);
      }
      else {
        d = {shadowMap: -1, ...data};
        lights.set(id, d);
      }

      if (shadow) {
        if (!maps.has(id)) maps.set(id, d);

        // Precalculate depth range constants
        const {depth: [near, far], bias, blur} = shadow;
        const nf = 1 / (near - far);
        const dx = far * nf + 1;
        const dy = -far * near * nf;
        if (!d.shadowDepth) d.shadowDepth = vec2.fromValues(dx, dy);

        d.shadowDepth[0] = dx;
        d.shadowDepth[1] = dy;
        d.shadowBias = bias;
        d.shadowBlur = blur;
      }
      else if (maps.has(id)) {
        maps.delete(id);
      }
    }

    return changed;
  }

  const clear = () => {
    queue.length = 0;
    changed.clear();
  };

  return {enqueue, dispose, flush, clear, lights, maps};
};

export const LightData: LiveComponent<LightDataProps> = (props: LightDataProps) => {
  const {
    reserve = 1,
    shadows = false,
    render,
    then,
  } = props;

  const {enqueue, dispose, flush, clear, lights, maps} = useOne(makeLightQueue);

  const useLight = useCallback((light: Light) => {
    const {id} = useFiber();
    useResource((d) => {
      d(() => dispose(id));
    });
    useCapture(LightCapture, null);
    enqueue(id, light);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const count = useOne(() => new Uint32Array(1));

  // Produce light/shadow sources
  const Resume = () => {
    const changed = flush();

    // Check if light / shadow configuration changed
    let lightKey = 0;
    let shadowKey = 0;

    for (const key of lights.keys()) lightKey = mixBits53(lightKey, key);
    for (const key of maps.keys()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const {shadow} = maps.get(key)!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const {size: [w, h]} = shadow!;
      shadowKey = mixBits53(mixBits53(mixBits53(shadowKey, key), w), h);
    }

    const lightCount = lights.size;
    const size = useBufferedSize(Math.max(reserve, lightCount + 1));
    const device = useDeviceContext();

    const prevDataRef = useRef<ArrayBuffer | null>(null);

    // Make light storage buffer
    const [storage, data, filler] = useMemo(() => {
      const data = makeLayoutData(LIGHT_LAYOUT, size, LIGHT_BYTE_OFFSET);
      const buffer = makeStorageBuffer(device, data);

      const {current: prevData} = prevDataRef;
      if (prevData) {
        const prevArray = new Uint32Array(prevData);
        const array = new Uint32Array(data);
        const n = Math.min(prevArray.length, array.length);
        for (let i = 0; i < n; ++i) array[i] = prevArray[i];
      }

      const storage = {
        buffer,
        format: WGSLLight,
        length: 0,
        size: [0],
        version: 0,
      } as any as StorageSource;

      const filler = makeLayoutFiller(LIGHT_LAYOUT, data);

      return [storage, data, filler];
    }, [device, size]);

    // Make shadow texture atlas
    const texture = useMemo(() => {
      if (!shadows) return null;

      const atlases: Atlas[] = [makeAtlasPage()];
      let [atlas] = atlases;

      for (const key of maps.keys()) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const light = maps.get(key)!;
        const {shadow} = light;
        if (shadow) {
          const {size: [w, h]} = shadow;

          let mapping;
          try {
            mapping = atlas.place(key, w, h);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (e) {
            atlases.push(atlas = makeAtlasPage());
            mapping = atlas.place(key, w, h);
          }
          const page = atlases.length - 1;

          light.shadowMap = page;
          light.shadowUV = (vec4.fromValues as any)(...mapping.map((x: number) => x / SHADOW_PAGE));
        }
      }

      const pages = atlases.length || 1;

      const texture = (
        makeTexture(
          device,
          SHADOW_PAGE,
          SHADOW_PAGE,
          pages,
          SHADOW_FORMAT,
          GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
          1,
          1,
          '2d',
          ATLAS_LABEL,
        )
      );

      const source = {
        texture,
        sampler: { compare: 'greater', minFilter: 'linear', magFilter: 'linear' },
        layout: "texture_depth_2d_array",
        format: SHADOW_FORMAT,
        length: SHADOW_PAGE * SHADOW_PAGE * pages,
        size: [SHADOW_PAGE, SHADOW_PAGE, pages],
        filter: 'comparison',
        version: 0,
        hint: 'depth',
      } as TextureSource;

      return source;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [device, shadows, shadowKey]);

    let needsRefresh = prevDataRef.current !== data;
    prevDataRef.current = data;

    // Compact light IDs into contiguous indices, ordered by light kind,
    // and calculate subranges by kind.
    const [indices, order, subranges] = useOne(() => {
      needsRefresh = true;

      const keys = [...lights.keys()];
      const order = seq(keys.length);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const kinds = keys.map(k => lights.get(k)!.kind);
      order.sort((a, b) => (kinds[a] - kinds[b]) || (a - b));

      const map = new Map<number, number>();
      const subranges = new Map<number, [number, number]>();

      let j = 0;
      for (const i of order) {
        map.set(keys[i], j);

        const kind = kinds[i];
        if (!subranges.has(kind)) subranges.set(kind, [j, j + 1]);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        else subranges.get(kind)![1] = j + 1;

        ++j;
      }

      return [map, order.map(i => keys[i]), subranges];
    }, lightKey);

    // Order changed lights by index
    const ids = needsRefresh ? [...lights.keys()] : [...changed.values()];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ids.sort((a, b) => indices.get(a)! - indices.get(b)!);

    // Update data sparsely while calculating upload ranges
    let ranges = [];
    let range: [number, number] | null = null;
    for (const id of ids) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const index = indices.get(id)!;

      if (!range) ranges.push(range = [index, index + 1]);
      else if (range[1] === index) range[1]++;
      else ranges.push(range = [index, index + 1]);

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      filler.setData(index, lights.get(id)!);
    }
    if (needsRefresh) ranges = [[0, size]];

    // Upload changed ranges
    if (ranges.length) {
      const {buffer} = storage;
      count[0] = lightCount;
      uploadBuffer(device, buffer, count.buffer);

      const stride = LIGHT_LAYOUT.length;
      for (const [from, to] of ranges) {
        uploadBufferRange(device, buffer, data, from * stride, (to - from) * stride, LIGHT_BYTE_OFFSET);
      }
    }

    storage.size[0] = storage.length = lightCount + 1;
    storage.version = incrementVersion(storage.version);
    if (texture) texture.version = incrementVersion(texture.version);

    clear();

    const lightEnv = useMemo(() => ({
      lights,
      shadows: maps,

      order,
      subranges,

      sources: {
        lightData: storage,
        shadowMap: texture,
      },
    }), [storage, texture, order, subranges]);

    return [
      signal(),
      then ? then(lightEnv) : yeet(lightEnv),
    ];
  };

  return render ? capture(LightCapture, render(useLight), Resume) : null;
};
