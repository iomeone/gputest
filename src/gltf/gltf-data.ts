import type { LC, LiveElement } from '@use-gpu/live';
import type { Point, StorageSource, TextureSource, TypedArray, UniformType } from '@use-gpu/core';
import type { GLTF, GLTFAccessorData, GLTFBufferData, GLTFBufferViewData, GLTFImageData, GLTFNodeData, GLTFMeshData, GLTFMaterialData, GLTFSceneData, GLTFTextureData } from './types';

import { use, gather, fence, suspend, yeet, useCallback, useContext, useOne, useMemo, useState } from '@use-gpu/live';

import { DeviceContext, Fetch, getBoundShader } from '@use-gpu/workbench';
import { makeDynamicTexture, makeStorageBuffer, uploadBuffer, uploadExternalTexture, toDataBounds, UNIFORM_ARRAY_TYPES } from '@use-gpu/core';

import { toScene, toNode, toMesh, toMaterial } from './parse';
import { generateTangents } from 'mikktspace';

const GLTF_MAGIC = 0x46546C67;
const STORAGE_ALIGNMENT = 256;
const NO_BINDINGS: any[] = [];
const NO_SAMPLER: any = {};

type GLTFStorageSource = StorageSource & { arrayBuffer: ArrayBuffer | null };

export type GLTFDataProps = {
  url?: string,
  data?: ArrayBuffer | string | Record<string, any>,
  base?: string,
  
  render?: (gltf: GLTF) => LiveElement,
};

const resolveURL = (base: string, url: string) => new URL(url, base).href;

export const GLTFData: LC<GLTFDataProps> = (props) => {
  const device = useContext(DeviceContext);

  const {
    data,
    url,
    render
  } = props;

  // Relative URL base for GLTF resources
  const base = props.base ?? new URL(props.url ?? ".", location.href).href;

  // Resume after loading GLTF manifest
  const Resume = ([data]: any[]) => {

    // Extract JSON
    const json = useOne(() => {
      try {
        if (typeof data === 'string') return JSON.parse(data);

        if (data instanceof ArrayBuffer) {
          const u32 = new Uint32Array(data.slice(0, 4));
          if (u32[0] === GLTF_MAGIC) throw new Error("binary gltf unimplemented");

          return JSON.parse(new TextDecoder().decode(data));
        }
        return data;
      } catch (e) {
        console.error(e)
        return null;
      }
    }, data);
    if (!json) return null;

    // Parse JSON into native types
    const {gltf, buffers, images, bufferAssets, imageAssets} = useOne(() => {
      const buffers = (json?.buffers ?? []) as GLTFBufferData[];
      const images  = (json?.images ?? []) as GLTFImageData[];

      const bufferAssets = buffers.filter(({uri}) => uri != null);
      const imageAssets  = images.filter(({uri}) => uri != null);

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

      return {gltf, buffers, images, bufferAssets, imageAssets};
    }, json);
  
    // Resume after loading resources
    const Resume = (resources: (ArrayBuffer | ImageBitmap | null)[]) => {
      const n = bufferAssets.length;

      const bufferAssetIndices = buffers.map(b => bufferAssets.indexOf(b));
      const imageAssetIndices = images.map(i => imageAssets.indexOf(i));

      // Gather raw arraybuffers / image resources
      const [bufferResources, imageResources] = useOne(() => [
        resources.slice(0, n),
        resources.slice(n),
      ] as [(ArrayBuffer | null)[], (ImageBitmap | null)[]], resources);

      const { accessors, bufferViews, samplers, textures } = gltf;

      // Upload all buffers as-is
      const gpuBuffers = useMap<GLTFBufferData, GPUBuffer | null>(buffers,
        (buffer, index) => {
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
        [buffers]);

      // Convert bufferviews to storage source templates
      const bufferSources = useMap<GLTFBufferViewData, GLTFStorageSource | null>(bufferViews,
        ({buffer, byteOffset, byteLength, byteStride}, index) => {
          if (byteStride != null && byteStride !== 1) throw new Error("byteStride != 1 not implemented");
      
          let gpuBuffer = gpuBuffers[buffer];
          if (!gpuBuffer) return null;

          let arrayBuffer = bufferResources[bufferAssetIndices[buffer]];
          if (!arrayBuffer) return null;

          // If GLTF alignment is too loose, slice and re-upload.
          if (byteOffset != null && ((byteOffset % STORAGE_ALIGNMENT) !== 0)) {
            const arraySlice = arrayBuffer.slice(byteOffset, byteLength != null ? byteOffset + byteLength : undefined);
            const b = makeStorageBuffer(device, arraySlice);

            uploadBuffer(device, b, arraySlice);
            gpuBuffer = b;
            byteOffset = 0;

            arrayBuffer = arraySlice;
          }

          return {
            buffer: gpuBuffer,
            arrayBuffer,

            format: '',
            length: 0,
            size: [0],
            version: 0,

            byteOffset,
            byteLength,
          };
        },
        ({buffer}, index) => gpuBuffers[buffer],
        [bufferViews]);
      
      // Convert accessors to storage sources
      const storageSources = useMap<GLTFAccessorData, GLTFStorageSource | null>(accessors,
        ({bufferView, componentType, count, min, max, type}, index) => {
          const bufferSource = bufferSources[bufferView ?? -1];
          if (!bufferSource) return null;

          const {byteLength, byteOffset} = bufferSource;
          const format = accessorToType(type, componentType);

          return {
            ...bufferSource,
            format: accessorToType(type, componentType),
            length: count,
            size: [count],
            bounds: min && max ? toDataBounds([min, max]) : undefined,
          };
        },
        ({bufferView}) => bufferSources[bufferView ?? -1],
        [accessors]);

      // Expose native typed arrays for further processing before upload
      const typedData = useMap<GLTFStorageSource | null, TypedArray | null>(storageSources,
        (source, index) => {
          if (!source) return null;

          const ctor = (UNIFORM_ARRAY_TYPES as any)[source.format];
          if (!ctor) return null;

          const {arrayBuffer, byteOffset, byteLength} = source;
          return arrayBuffer ? new ctor(arrayBuffer.slice(byteOffset ?? 0, byteLength)) : null;
        },
        (source) => source,
        []);

      // Convert images to external textures
      const imageSources = useMap<GLTFImageData | null, TextureSource | null>(images,
        (image, index) => {
          const i = imageAssetIndices[index];
          if (i >= 0) {
            const bitmap = imageResources[i];
            if (!bitmap) return null;

            const size = [bitmap.width, bitmap.height] as Point;
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
        ({sampler, source}, index) => {
          const imageSource = imageSources[source as any];
          if (!imageSource) return null;
      
          return {
            ...imageSource,
            sampler: samplerToDescriptor(samplers[sampler as any]),
            version: 1,
          };
        },
        ({source}, index) => imageSources[source as any],
        [textures]);

      const bound = {
        data: typedData,
        storage: storageSources,
        texture: textureSources,
      };

      /*
      console.log('re-render gltf', gltf, bound);
      console.log({
        bufR: bufferResources.slice().filter(x => !!x),
        imgR: imageResources.slice().filter(x => !!x),
      })
      */

      const gltfBound = {
        ...gltf,
        bound,
      };
      return render ? render(gltfBound) : yeet(gltfBound);
    };

    // Load external assets
    return bufferAssets.length + imageAssets.length ? (
      gather(use(Throttle, [

        ...bufferAssets.map(({uri}) => uri ? use(Fetch, {
          url: resolveURL(base, uri),
          type: 'arrayBuffer',
          loading: null,
        }) : yeet(null)),

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
  if (props.data) return use(Resume, [props.data]);
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
