import type { LC, LiveElement } from '@use-gpu/live';
import type { XY, StorageSource, TextureSource, TypedArray, UniformType } from '@use-gpu/core';
import type { GLTF, GLTFAccessorData, GLTFBufferData, GLTFBufferViewData, GLTFImageData, GLTFNodeData, GLTFMeshData, GLTFMaterialData, GLTFSceneData, GLTFTextureData } from './types';

import { use, gather, fence, suspend, yeet, useContext, useOne, useMemo, useState } from '@use-gpu/live';

import { DeviceContext, Fetch, useRenderProp } from '@use-gpu/workbench';
import { makeDynamicTexture, makeStorageBuffer, uploadBuffer, uploadExternalTexture, toDataBounds, UNIFORM_ARRAY_TYPES, UNIFORM_ARRAY_DIMS } from '@use-gpu/core';

import { parseBinaryGLTF, parseTextGLTF, toScene, toNode, toMesh, toMaterial } from './parse';

const STORAGE_ALIGNMENT = 256;
const SIZE_ALIGNMENT = 16;
const NO_SAMPLER: any = {};

type GLTFStorageSource = StorageSource & { arrayBuffer: ArrayBuffer | null };

export type GLTFDataProps = {
  url?: string,
  data?: ArrayBuffer | string | Record<string, any>,
  base?: string,
  unbound?: boolean,

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
  } = props;

  // Relative URL base for GLTF resources
  const base = props.base ?? new URL(props.url ?? ".", location.href).href;

  // Resume after loading GLTF manifest
  const Resume = ([data]: any[]) => {

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
    const {
      gltf,
      buffers,
      images,
      bufferAssets,
      bufferAssetIndices,
      imageAssets,
      imageAssetIndices,
    } = useOne(() => {
      const version = json?.asset?.version;
      if (version != null && parseFloat(version) !== 2) throw new Error(`Unsupported GLTF version '${version}'`);

      const buffers = (json?.buffers ?? []) as GLTFBufferData[];
      const images  = (json?.images ?? []) as GLTFImageData[];

      const bufferAssets = buffers.filter(({uri}, i) => (uri != null) || i === 0);
      const imageAssets  = images.filter(({uri}) => uri != null);

      const bufferAssetIndices = buffers.map(b => bufferAssets.indexOf(b));
      const imageAssetIndices = images.map(i => imageAssets.indexOf(i));

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
        buffers,
        images,
        bufferAssets,
        bufferAssetIndices,
        imageAssets,
        imageAssetIndices,
      };
    }, json);

    // Resume after loading resources
    const Resume = (resources: (ArrayBuffer | ImageBitmap | null)[]) => {
      const n = bufferAssets.length;

      // Gather raw arraybuffers / image resources
      const [bufferResources, imageResources] = useOne(() => [
        resources.slice(0, n),
        resources.slice(n),
      ] as [(ArrayBuffer | null)[], (ImageBitmap | null)[]], resources);

      const { accessors, bufferViews, samplers, textures } = gltf;

      // Expose native typed arrays for further processing before upload
      const typedFormats = useMap<GLTFAccessorData, string>(accessors,
        ({type, componentType}) => {
          return accessorToType(type, componentType);
        },
        (accessor) => accessor,
        [accessors]);

      const typedArrays = useMap<GLTFAccessorData, TypedArray | null>(accessors,
        ({bufferView, componentType, count, type, sparse}) => {
          if (sparse) throw new Error("sparse GLTF accessors not implemented");

          const format = accessorToType(type, componentType);
          const ctor = (UNIFORM_ARRAY_TYPES as any)[format];
          const dims = (UNIFORM_ARRAY_DIMS as any)[format];
          if (!ctor) return null;

          if (!bufferView) return new ctor(count * Math.floor(dims));

          const {buffer, byteLength, byteOffset} = bufferViews[bufferView];
          const arrayBuffer = bufferResources[bufferAssetIndices[buffer]];
          if (!arrayBuffer) return null;

          const s = byteOffset ?? 0;
          const e = byteLength != null ? s + byteLength : undefined;
          return new ctor(arrayBuffer.slice(s, e));
        },
        ({bufferView}) => bufferView != null
          ? bufferResources[bufferAssetIndices[bufferViews[bufferView].buffer]]
          : null,
        [accessors]);

      // Upload all buffers as-is
      const gpuBuffers = useMap<GLTFBufferData, GPUBuffer | null>(buffers,
        (buffer, index) => {
          if (unbound) return null;

          const i = bufferAssetIndices[index];
          if (i >= 0) {
            if (!bufferResources[i]) return null;

            const b = makeStorageBuffer(device, buffer.byteLength);
            uploadBuffer(device, b, bufferResources[i] as ArrayBuffer);
            return b;
          }
          else throw new Error('GLTF buffer without data');
        },
        (buffer, index) => bufferResources[bufferAssetIndices[index]],
        [buffers, unbound]);

      // Convert bufferviews to storage source templates
      const bufferSources = useMap<GLTFBufferViewData, GLTFStorageSource | null>(bufferViews,
        ({buffer, byteOffset, byteLength, byteStride}) => {
          if (byteStride != null && byteStride !== 1) throw new Error("byteStride != 1 not implemented");

          let gpuBuffer = gpuBuffers[buffer];
          if (!gpuBuffer) return null;

          let arrayBuffer = bufferResources[bufferAssetIndices[buffer]];
          if (!arrayBuffer) return null;

          // If GLTF alignment is too loose, slice and re-upload.
          if (byteOffset != null && ((byteOffset % STORAGE_ALIGNMENT) !== 0)) {
            if (byteLength != null) byteLength = Math.min(arrayBuffer.byteLength - byteOffset, alignTo(byteLength, SIZE_ALIGNMENT));

            const arraySlice = arrayBuffer.slice(byteOffset, byteLength != null ? byteOffset + byteLength : undefined);
            const b = makeStorageBuffer(device, arraySlice);

            uploadBuffer(device, b, arraySlice);
            gpuBuffer = b;
            byteOffset = 0;

            arrayBuffer = arraySlice;
          }
          else {
            if (byteLength != null) byteLength = Math.min(arrayBuffer.byteLength, alignTo(byteLength, SIZE_ALIGNMENT));
          }

          return {
            buffer: gpuBuffer,
            arrayBuffer,

            format: '' as any,
            length: 0,
            size: [0],
            version: 0,

            byteOffset,
            byteLength,
          };
        },
        ({buffer}) => gpuBuffers[buffer],
        [bufferViews]);

      // Convert accessors to storage sources
      const storageSources = useMap<GLTFAccessorData, GLTFStorageSource | null>(accessors,
        ({bufferView, componentType, count, min, max, type}) => {
          const bufferSource = bufferSources[bufferView ?? -1];
          if (!bufferSource) return null;

          const format = accessorToType(type, componentType);

          return {
            ...bufferSource,
            format,
            length: count,
            size: [count],
            bounds: min && max ? toDataBounds({min, max}) : undefined,
          };
        },
        ({bufferView}) => bufferSources[bufferView ?? -1],
        [accessors]);

      // Convert images to external textures
      const imageSources = useMap<GLTFImageData | null, TextureSource | null>(images,
        (image, index) => {
          if (unbound) return null;

          const i = imageAssetIndices[index];
          if (i >= 0) {
            const bitmap = imageResources[i];
            if (!bitmap) return null;

            const size = [bitmap.width, bitmap.height] as XY;
            const format = 'rgba8unorm';
            const colorSpace = 'auto';

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
          }
          else throw new Error('GLTF image without data');
        },
        (image, index) => imageResources[imageAssetIndices[index]],
        [images]);

      // Convert textures to texture sources
      const textureSources = useMap<GLTFTextureData, TextureSource | null>(textures,
        ({sampler, source}) => {
          const imageSource = imageSources[source as any];
          if (!imageSource) return null;

          return {
            ...imageSource,
            sampler: samplerToDescriptor(samplers[sampler as any]),
            version: 1,
          };
        },
        ({source}) => imageSources[source as any],
        [textures]);

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

      ], 0), Resume)
    ) : use(Resume, []);
  };

  // Load GLTF or use inline data
  if (data) return use(Resume, [data]);
  else return gather(use(Fetch, {
    url,
    type: 'arrayBuffer',
  }), Resume);
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

  const values = useMemo(() => args?.map(() => null as B | null), deps);
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
