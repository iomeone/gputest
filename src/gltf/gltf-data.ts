import type { LC, LiveElement } from '@use-gpu/live';
import type { XY, StorageSource, TextureSource, TypedArray, UniformType } from '@use-gpu/core';
import type { GLTF, GLTFAccessorData, GLTFBufferData, GLTFImageData, GLTFNodeData, GLTFMeshData, GLTFMaterialData, GLTFSceneData, GLTFTextureData } from './types';

import { use, keyed, gather, fence, suspend, yeet, useContext, useOne, useMemo, useState, useVersion } from '@use-gpu/live';

import { Await, DeviceContext, Fetch, useRenderProp, useInspectable } from '@use-gpu/workbench';
import { makeDynamicTexture, makeStorageBuffer, uploadBuffer, uploadExternalTexture, toDataBounds, UNIFORM_ATTRIBUTE_SIZES, UNIFORM_ARRAY_TYPES, UNIFORM_ARRAY_DIMS } from '@use-gpu/core';

import { parseBinaryGLTF, parseTextGLTF, toScene, toNode, toMesh, toMaterial } from './parse';

const SIZE_ALIGNMENT = 16;
const NO_SAMPLER: any = {};

type GLTFStorageSource = StorageSource & { arrayBuffer: ArrayBuffer | null };

export type GLTFDataProps = {
  url?: string,
  data?: ArrayBuffer | string | Record<string, any>,
  base?: string,
  unbound?: boolean,
  partial?: boolean,
  fallback?: LiveElement,

  render?: (gltf: GLTF) => LiveElement,
  children?: (gltf: GLTF) => LiveElement,
};

type ParsedGLTF = {
  json: any,
  bin?: ArrayBuffer,
};

const resolveURL = (base: string, url: string) => new URL(url, base).href;

const alignTo = (size: number, align: number) => Math.ceil(size / align) * align;

export const GLTFData: LC<GLTFDataProps> = (props) => {
  const device = useContext(DeviceContext);

  const {
    data,
    url,
    unbound,
    fallback = null,
    partial = false,
  } = props;

  // Relative URL base for GLTF resources
  const base = props.base ?? new URL(props.url ?? ".", location.href).href;

  // Resume after loading GLTF manifest
  const Resume = ([data]: any[]) => {
    if (!data) return fallback;

    // Extract JSON
    const parsed = useOne((): ParsedGLTF | null => {
      try {
        if (typeof data === 'string') return {json: JSON.parse(data)};
        if (data instanceof ArrayBuffer) return parseBinaryGLTF(data) || parseTextGLTF(data);
        return {json: data};
      } catch (e) {
        console.error(e)
        return null;
      }
    }, data);
    if (!parsed) return null;

    // Parse JSON into native types
    const {json, bin} = parsed;
    if (!json) return null;

    const {
      gltf,
      images,
      bufferAssets,
      bufferAssetIndices,
      imageAssets,
      imageAssetIndices,
      inlineAssets,
      inlineAssetIndices,
    } = useOne(() => {
      const version = json?.asset?.version;
      if (version != null && parseFloat(version) !== 2) throw new Error(`Unsupported GLTF version '${version}'`);

      const buffers = (json?.buffers ?? []) as GLTFBufferData[];
      const images  = (json?.images ?? []) as GLTFImageData[];

      const bufferAssets = buffers.filter(({uri}, i) => (uri != null) || i === 0);
      const imageAssets  = images.filter(({uri}) => uri != null);
      const inlineAssets  = images.filter(({bufferView}) => bufferView != null);

      const bufferAssetIndices = buffers.map(b => bufferAssets.indexOf(b));
      const imageAssetIndices = images.map(i => imageAssets.indexOf(i));
      const inlineAssetIndices = images.map(i => inlineAssets.indexOf(i));

      const scenes:    GLTFSceneData    = (json?.scenes    ?? []).map(toScene);
      const nodes:     GLTFNodeData     = (json?.nodes     ?? []).map(toNode);
      const meshes:    GLTFMeshData     = (json?.meshes    ?? []).map(toMesh);
      const materials: GLTFMaterialData = (json?.materials ?? []).map(toMaterial);

      const gltf = {
        ...json,
        scenes,
        nodes,
        meshes,
        materials,
      };

      return {
        gltf,
        images,
        bufferAssets,
        bufferAssetIndices,
        imageAssets,
        imageAssetIndices,
        inlineAssets,
        inlineAssetIndices,
      };
    }, json);

    // Resume after loading resources
    const Resume = (resources: (ArrayBuffer | ImageBitmap | null)[]) => {
      const inspect = useInspectable();

      const { accessors, bufferViews, samplers, textures } = gltf;

      const n = bufferAssets.length;
      const m = imageAssets.length;
      const o = inlineAssets.length;

      if (!partial && (resources.length < n + m + o || resources.some(r => r == null))) return fallback;

      // Gather raw arraybuffers / image resources
      const [bufferResources, imageResources, inlineResources] = useOne(() => [
        resources.slice(0, n),
        resources.slice(n, n + m),
        resources.slice(n + m),
      ] as [(ArrayBuffer | null)[], (ImageBitmap | null)[], (ImageBitmap | null)[]], resources);

      // Expose native typed arrays for further processing before upload
      const typedFormats = useMap<GLTFAccessorData, string>(accessors,
        ({type, componentType}) => {
          return accessorToType(type, componentType);
        },
        (accessor) => accessor,
        [accessors]);

      const typedArrays = useMap<GLTFAccessorData, TypedArray | null>(accessors,
        ({bufferView, byteOffset, componentType, count, type, sparse}) => {
          if (sparse) throw new Error("sparse GLTF accessors not implemented");

          const format = accessorToType(type, componentType);
          const ctor = (UNIFORM_ARRAY_TYPES as any)[format];
          const dims = (UNIFORM_ARRAY_DIMS as any)[format];
          const size = (UNIFORM_ATTRIBUTE_SIZES as any)[format];
          if (!ctor) return null;

          if (bufferView == null) return new ctor(count * Math.floor(dims));

          const {buffer, byteLength, byteOffset: viewByteOffset, byteStride} = bufferViews[bufferView];
          const arrayBuffer = bufferResources[bufferAssetIndices[buffer]];
          if (!arrayBuffer) return null;

          if (byteStride != null && byteStride !== size) {
            throw new Error("byteStride != size not implemented");
          }

          const s = (viewByteOffset ?? 0) + (byteOffset ?? 0);
          const e = byteLength != null ? s + byteLength : undefined;
          const arraySlice = arrayBuffer.slice(s, e);
          return new ctor(arraySlice);
        },
        ({bufferView}) => bufferView != null
          ? bufferResources[bufferAssetIndices[bufferViews[bufferView].buffer]]
          : null,
        [accessors]);

      // Convert accessors to storage sources
      const storageSources = useMap<GLTFAccessorData, GLTFStorageSource | null>(accessors,
        ({bufferView, byteOffset, componentType, count, min, max, type}) => {
          if (bufferView == null) return null;

          const {buffer, byteLength, byteOffset: viewByteOffset, byteStride} = bufferViews[bufferView] ?? {};
          const arrayBuffer = bufferResources[bufferAssetIndices[buffer]];
          if (!arrayBuffer) return null;

          const format = accessorToType(type, componentType);
          const size = (UNIFORM_ATTRIBUTE_SIZES as any)[format];
          if (byteStride != null && byteStride !== size) {
            throw new Error("byteStride != size not implemented");
          }

          // Because GLTF alignment is too loose for WebGPU, slice and upload separately.
          let length = null;
          const s = (viewByteOffset ?? 0) + (byteOffset ?? 0);
          if (byteLength != null) length = Math.min(arrayBuffer.byteLength - s, alignTo(byteLength, SIZE_ALIGNMENT));

          const e = length != null ? s + length : undefined;
          const arraySlice = arrayBuffer.slice(s, e);

          const gpuBuffer = makeStorageBuffer(device, arraySlice);
          uploadBuffer(device, gpuBuffer, arraySlice);

          return {
            buffer: gpuBuffer,
            arrayBuffer: arraySlice,

            byteOffset: 0,
            byteLength,
            version: 0,

            format,
            length: count,
            size: [count],
            bounds: min && max ? toDataBounds({min, max}) : undefined,
          };
        },
        ({bufferView}) => bufferResources[bufferAssetIndices[bufferViews[bufferView ?? -1]?.buffer]],
        [accessors]);

      // Convert images to external textures
      const imageSources = useMap<GLTFImageData | null, TextureSource | null>(images,
        (image, index) => {
          if (unbound) return null;

          const format = 'rgba8unorm';
          const colorSpace = 'auto';

          const i = imageAssetIndices[index];
          const j = inlineAssetIndices[index];
          if (i >= 0 || j >= 0) {
            const bitmap = imageResources[i] || inlineResources[j];
            if (!bitmap) return null;

            const size = [bitmap.width, bitmap.height] as XY;

            const texture = makeDynamicTexture(device, bitmap.width, bitmap.height, 1, format);
            uploadExternalTexture(device, texture, bitmap, size);

            return {
              texture,
              format,
              size,
              colorSpace,
              sampler: NO_SAMPLER,
              layout: 'texture_2d<f32>',
              version: 0,
            };
          } else {
            throw new Error('GLTF image without data');
          }
        },
        (image, index) => imageResources[imageAssetIndices[index]] ?? inlineResources[inlineAssetIndices[index]],
        [images]);

      // Convert textures to texture sources
      const textureSources = useMap<GLTFTextureData, TextureSource | null>(textures,
        ({sampler, source}) => {
          const imageSource = imageSources[source as any];
          if (!imageSource) return null;

          return {
            ...imageSource,
            sampler: samplerToDescriptor(samplers?.[sampler as any] ?? {}),
            version: 1,
          };
        },
        ({source}) => imageSources[source as any],
        [textures]);

      inspect({ output: { source: textureSources }});

      const data = {
        arrays: typedArrays,
        formats: typedFormats,
      };

      const bound = !unbound ? {
        storage: storageSources,
        texture: textureSources,
      } : undefined;

      const gltfBound = {
        ...gltf,
        data,
        bound,
      };

      return useRenderProp(props, gltfBound);
    };

    // Load inline assets
    const Inline = (resources: (ArrayBuffer | ImageBitmap | null)[]) => {
      const bufferResources = resources;
      const { bufferViews } = gltf;

      // Make native bitmaps out of inline array buffers
      const inlineResources = useMap<GLTFImageData, LiveElement>(
        inlineAssets,
        ({bufferView, mimeType}) => {
          const fn = async () => {
            if (bufferView == null) return null;

            const {buffer, byteOffset, byteLength, byteStride} = bufferViews[bufferView];
            if (byteStride != null && byteStride !== 1) throw new Error("byteStride != 1 not implemented for images");

            const arrayBuffer = (bufferResources as ArrayBuffer[])[bufferAssetIndices[buffer]];
            if (!arrayBuffer) return null;

            const arraySlice = arrayBuffer.slice(byteOffset, byteLength != null ? byteOffset + byteLength : undefined);
            const blob = new Blob([arraySlice], {
              type: mimeType,
            });

            const image = await createImageBitmap(blob, {
              premultiplyAlpha: 'default',
              colorSpaceConversion: 'none',
            });

            return yeet(image);
          };

          return use(Await, {promise: fn()});
        },
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ({bufferView}) => bufferResources[bufferAssetIndices[bufferViews[bufferView!]?.buffer]],
        [inlineAssets]);

      return gather([
        yeet(resources),
        ...inlineResources,
      ], Resume);
    };

    // Load external assets
    return bufferAssets.length + imageAssets.length ? (
      gather(use(Throttle, [

        ...bufferAssets.map(({uri}, i) => uri ? use(Fetch, {
          url: resolveURL(base, uri),
          type: 'arrayBuffer',
          loading: null,
        }) : yeet(i === 0 ? bin : null)),

        ...imageAssets.map(({uri}) => uri ? use(Fetch, {
          url: resolveURL(base, uri),
          type: 'blob',
          loading: null,
          then: (blob: Blob | null) => {
            if (blob == null) return null;

            return createImageBitmap(blob, {
              premultiplyAlpha: 'default',
              colorSpaceConversion: 'none',
            });
          },
        }) : yeet(null))

      ], 0), Inline)
    ) : use(Inline, []);
  };

  const key = useVersion(data ?? url);

  // Load GLTF or use inline data
  if (data) return keyed(Resume, key, [data]);
  else return gather(use(Fetch, {
    url,
    type: 'arrayBuffer',
    loading: null,
  }), Resume, undefined, key);
};

const samplerToDescriptor = (sampler: any): GPUSamplerDescriptor => {
  const {magFilter, minFilter, wrapS, wrapT} = sampler;

  const min =
    minFilter === 9728 ? 'nearest' :
    minFilter === 9729 ? 'linear'  :
    minFilter === 9984 ? 'nearest' :
    minFilter === 9985 ? 'linear'  :
    minFilter === 9986 ? 'nearest' :
    minFilter === 9987 ? 'linear'  : 'linear';

  const mag =
    magFilter === 9728 ? 'nearest' :
    magFilter === 9729 ? 'linear'  : 'linear';

  const mip =
    minFilter === 9984 ? 'nearest' :
    minFilter === 9985 ? 'nearest' :
    minFilter === 9986 ? 'linear'  :
    minFilter === 9987 ? 'linear'  : 'linear';

  const addressModeU =
    wrapS === 33071 ? 'clamp-to-edge' :
    wrapS === 33648 ? 'mirror-repeat' :
    wrapS === 10497 ? 'repeat' : 'repeat'

  const addressModeV =
    wrapT === 33071 ? 'clamp-to-edge' :
    wrapT === 33648 ? 'mirror-repeat' :
    wrapT === 10497 ? 'repeat' : 'repeat';

  return {
    minFilter: min,
    magFilter: mag,
    mipmapFilter: mip,
    addressModeU,
    addressModeV,
  };
}

// Convert GL-style accessor type to uniform type
const accessorToType = (boxType: string, componentType: number): UniformType => {
  let type: UniformType | null = null;

  if (componentType === 5120) type = 'i8';
  if (componentType === 5121) type = 'u8';
  if (componentType === 5122) type = 'i16';
  if (componentType === 5123) type = 'u16';
  if (componentType === 5125) type = 'u32';
  if (componentType === 5126) type = 'f32';

  if (type === null) throw new Error(`Unsupported GLTF accessor component type ${componentType}`);

  if (boxType === 'SCALAR') return type;
  if (boxType === 'VEC2')   return `vec2<${type}>`;
  if (boxType === 'VEC3')   return `vec3to4<${type}>`;
  if (boxType === 'VEC4')   return `vec4<${type}>`;
  if (boxType === 'MAT2' && type === 'f32')   return `mat2x2<${type}>`;
  if (boxType === 'MAT3' && type === 'f32')   return `mat3x3<${type}>`;
  if (boxType === 'MAT4' && type === 'f32')   return `mat4x4<${type}>`;

  throw new Error(`Unsupported GLTF accessor type ${boxType}`);
};

type Timeout = ReturnType<typeof setTimeout>;

// If model is partially loaded, wait to see if more textures arrive before rendering.
const Throttle = <T>(children: LiveElement, delay: number = 300) => {

  let timer: Timeout | null = null;

  const valueRef = useOne(() => ({current: null as (T | null)[] | null}));

  return fence(children, (value: (T | null)[]) => {
    valueRef.current = value;

    // If everything is loaded, resolve immediately
    const notNull = value.indexOf(null) < 0;
    if (notNull) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      return yeet(value);
    }

    // If nothing is loaded, resolve immediately
    const entirelyNull = value.findIndex(v => v != null) < 0;
    if (entirelyNull) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      return yeet(value);
    }

    // Wait before resolving
    const [resolved, setResolved] = useState<(T | null)[] | null>(null);
    if (resolved !== value && !timer) {
      timer = setTimeout(() => {
        timer = null;
        setResolved(valueRef.current);
      }, delay);
    }

    return resolved != null ? yeet(resolved) : suspend();
  });
}

// Resumable progressive map
const NO_DEPS: any = [];
const useMap = <A, B>(
  args: (A | null)[] | null | undefined,
  map: (a: A, i: number) => B,
  key: (a: A, i: number) => any,
  deps: any[] = NO_DEPS,
): (B | null)[] => {

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const values = useMemo(() => args?.map(() => null as B | null), deps);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const keys = useMemo(() => args?.map(() => null as B | null), deps);

  if (!values || !keys || !args) return NO_DEPS;

  const n = args.length;
  for (let i = 0; i < n; ++i) {
    const a = args[i];
    if (a == null) values[i] = null;
    else {
      const k = key(a, i);
      if (k !== keys[i]) {
        values[i] = map(a, i);
        keys[i] = k;
      }
    }
  }
  if (values.length !== n) values.length = n;

  return values;
};
