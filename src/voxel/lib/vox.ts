import type { Point3 } from '@use-gpu/core';
import type {
  RawVox,
  RawChunk,
  VoxShape,
  VoxNodeInfo,
  VoxNodeShape,
  VoxNodeGroup,
  VoxNodeTransform,  
  VoxMeta,
  VoxProps,
  VoxOptions,
  VoxFile,
} from '../types';

// Based on:
// https://github.com/ephtracy/voxel-model/blob/master/MagicaVoxel-file-format-vox.txt
// https://github.com/ephtracy/voxel-model/blob/master/MagicaVoxel-file-format-vox-extension.txt
const VOX_MAGIC = 0x20584F56;

const EMPTY_DICT: VoxProps = {};
const EMPTY_LIST: any[] = [];
const EMPTY_MATRIX: number[] = [
  0, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 0,
  0, 0, 0, 1,
];

const tail = <T>(list: T[]): T => list[list.length - 1];

type Pointer = {offset: number};

const DEFAULT_OPTIONS = {
  mips: 3,
  nodes: true,
  materials: true,
  layers: false,
  cameras: false,
  objects: false,
};

export const parseVox = (
  data: ArrayBuffer,
  options: Partial<VoxOptions> = DEFAULT_OPTIONS,
): VoxFile => {
  options = {...DEFAULT_OPTIONS, ...options};

  const shapes: VoxShape[] = [];
  const palette = new Uint32Array(256);
  const pbr = new Float32Array(256 * 4);

  const rgba = new Uint32Array(256);
  const imap = new Uint32Array(256);
  let hasImap = false;

  const nodes:     VoxNodeInfo[]  = options.nodes     ? [] : EMPTY_LIST;
  const layers:    VoxMeta[]  = options.layers    ? [] : EMPTY_LIST;
  const materials: VoxMeta[]  = options.materials ? [] : EMPTY_LIST;
  const cameras:   VoxMeta[]  = options.cameras   ? [] : EMPTY_LIST;
  const objects:   VoxProps[] = options.objects   ? [] : EMPTY_LIST;

  const {version, chunks} = parseVoxChunks(data);

  const view = new DataView(data);
  for (const {id, children} of chunks) {
    if (id === 'MAIN') {
      if (children) for (const chunk of children) {
        const {id} = chunk; 

        if (id === 'SIZE') {
          const size = parseSIZEChunk(view, chunk);
          const [w, h, d] = size;
          const object = {
            size,
            data: new Uint8Array(w * h * d),
          };
          shapes.push(object);
        }

        else if (id === 'XYZI') {
          const shape = tail(shapes);
          parseXYZIChunk(view, chunk, shape);
        }

        else if (id === 'RGBA') {
          parseRGBAChunk(view, chunk, rgba);
        }

        else if (id === 'IMAP') {
          hasImap = true;
          parseIMAPChunk(view, chunk, imap);
        }

        else if (id === 'nTRN' && options.nodes) {
          nodes.push(parseNTRNChunk(view, chunk));
        }
        else if (id === 'nGRP' && options.nodes) {
          nodes.push(parseNGRPChunk(view, chunk));
        }
        else if (id === 'nSHP' && options.nodes) {
          nodes.push(parseNSHPChunk(view, chunk));
        }

        else if (id === 'LAYR' && options.layers) {
          layers.push(parseMetaChunk(view, chunk));
        }
        else if (id === 'MATL' && options.materials) {
          materials.push(parseMetaChunk(view, chunk));
        }
        else if (id === 'rCAM' && options.cameras) {
          cameras.push(parseMetaChunk(view, chunk));
        }
        else if (id === 'rOBJ' && options.objects) {
          objects.push(parsePropsChunk(view, chunk));
        }
      }
    }
  }
  
  if (hasImap) for (let i = 0; i < 256; ++i) palette[imap[i]] = rgba[i];
  else for (let i = 0; i < 256; ++i) palette[i + 1] = rgba[i];
  for (const material of materials) decodeMaterial(material, pbr);

  const vox = {
    shapes,
    nodes,
    palette,
    pbr,

    layers,
    materials,
    objects,
    cameras,
  };

  return vox;
};

///////////////////////////////////////////////////////////////////////////////
// MIP mapping downscale
///////////////////////////////////////////////////////////////////////////////
export const getMipShape = (shape: VoxShape) => {
  const {size, data} = shape;
  const [w, h, d] = size;

  const w2 = Math.ceil(w / 2) || 1;
  const h2 = Math.ceil(h / 2) || 1;
  const d2 = Math.ceil(d / 2) || 1;

  const wh = w * h;
  const wh2 = w2 * h2;

  const out = new Uint8Array(w2 * h2 * d2);
  let o = 0;
  for (let z = 0, z2 = 0; z2 < d2; z += 2, z2++) {
    for (let y = 0, y2 = 0; y2 < h2; y += 2, y2++) {
      for (let x = 0, x2 = 0; x2 < w2; x += 2, x2++) {
        let i = x + y * w + z * wh;
        out[o++] = (
          data[i] || data[i + 1] ||
          data[i + w] || data[i + w + 1] ||
          data[i + wh] || data[i + wh + 1] ||
          data[i + wh + w] || data[i + wh + w + 1]
        );
      }
    }
  }

  return {
    size: [w2, h2, d2] as Point3,
    data: out,
  };
};

///////////////////////////////////////////////////////////////////////////////
// Decode node transforms to column-major 4x4 matrix
///////////////////////////////////////////////////////////////////////////////
export const decodeTransform = (frame: VoxProps) => {
  const {_r = 0, _t} = frame;

  const transform = new Float32Array(EMPTY_MATRIX);
  if (_t) {
    const [x, y, z] = _t.split(' ').map(x => parseInt(x));
    transform[12] = x;
    transform[13] = y;
    transform[14] = z;
  }

  const index1 = _r ?  (+_r & 0x3) : 0;
  const index2 = _r ? ((+_r & 0xc) >> 2) : 1;

  const min = Math.min(index1, index2);
  const max = Math.max(index1, index2);
  const index3 = (
    min > 0 ? 0 :
    max < 2 ? 2 :
    1
  );

  const signX = 1 - +!!(+_r & (1 << 4)) * 2;
  const signY = 1 - +!!(+_r & (1 << 5)) * 2;
  const signZ = 1 - +!!(+_r & (1 << 6)) * 2;

  transform[index1 * 4    ] = signX;
  transform[index2 * 4 + 1] = signY;
  transform[index3 * 4 + 2] = signZ;

  return transform;
};

///////////////////////////////////////////////////////////////////////////////
// Decode material to standard PBR parameters
///////////////////////////////////////////////////////////////////////////////
export const decodeMaterial = (material: VoxMeta, pbr: Float32Array) => {
  const {id, props: {_type, _metal, _rough, _emit, _weight}} = material;
  const offset = id * 4;
  pbr[offset    ] = _metal  ? parseFloat(_metal)  : 1;
  pbr[offset + 1] = _rough  ? parseFloat(_rough)  : 1;
  pbr[offset + 2] = _emit   ? parseFloat(_emit)   : 0;
  pbr[offset + 3] = _weight ? parseFloat(_weight) : 1;
};

///////////////////////////////////////////////////////////////////////////////
// Vox container parser
///////////////////////////////////////////////////////////////////////////////

export const parseVoxChunks = (data: ArrayBuffer): RawVox => {
  const view = new DataView(data);
  const ptr = {offset: 0};

  const magic = getUint32(view, ptr);
  if (magic !== 0x20584F56) throw new Error(`Invalid .vox header '0x${magic.toString(16)}'`);

  const version = getUint32(view, ptr);
  if (version !== 150) throw new Error(`Unsupported .vox version '${version}'`);

  let n = data.byteLength;
  const chunks: RawChunk[] = [];
  while (ptr.offset < n) {
    chunks.push(getNextChunk(view, ptr));
  };

  return {version, chunks};
};

export const getNextChunk = (view: DataView, ptr: Pointer): RawChunk => {
  const id = getChunkId(view, ptr);
  const chunkSize = getUint32(view, ptr);
  const childrenSize = getUint32(view, ptr);

  const base = ptr.offset;
  const length = chunkSize;

  ptr.offset += length;

  let children: RawChunk[] | undefined;
  if (childrenSize) {
    children = [];

    let child: RawChunk;
    const end = ptr.offset + childrenSize;
    while (ptr.offset < end) children.push(getNextChunk(view, ptr));
  }

  return {id, base, length, children};
};

///////////////////////////////////////////////////////////////////////////////
// Chunk type parsers
///////////////////////////////////////////////////////////////////////////////

export const parseSIZEChunk = (view: DataView, chunk: RawChunk): Point3 => {
  const {base} = chunk;
  const ptr = {offset: base};

  return [
    getUint32(view, ptr),
    getUint32(view, ptr),
    getUint32(view, ptr),
  ];
};

export const parseXYZIChunk = (view: DataView, chunk: RawChunk, shape: VoxShape) => {
  const {size, data} = shape;
  const {base} = chunk;
  const ptr = {offset: base};

  const n = getUint32(view, ptr);
  const [w, h] = size;
  const wh = w * h;

  for (let i = 0; i < n; ++i) {
    const x = getUint8(view, ptr);
    const y = getUint8(view, ptr);
    const z = getUint8(view, ptr);
    const c = getUint8(view, ptr);
    data[x + y * w + z * wh] = c;
  }
};

export const parseRGBAChunk = (view: DataView, chunk: RawChunk, rgba: Uint32Array) => {
  const {base} = chunk;
  const ptr = {offset: base};

  for (let i = 0; i < 256; ++i) {
    rgba[i] = getUint32(view, ptr);
  }
};

export const parseIMAPChunk = (view: DataView, chunk: RawChunk, imap: Uint32Array) => {
  const {base} = chunk;
  const ptr = {offset: base};

  for (let i = 0; i < 256; ++i) {
    imap[i] = getUint8(view, ptr);
  }
};

export const parsePropsChunk = (view: DataView, chunk: RawChunk): VoxProps => {
  const {base, length} = chunk;
  const ptr = {offset: base};

  return getDict(view, ptr);
};

export const parseMetaChunk = (view: DataView, chunk: RawChunk, hasId: boolean = true): VoxMeta => {
  const {base, length} = chunk;
  const ptr = {offset: base};

  const id = getUint32(view, ptr);
  const props = getDict(view, ptr);

  return {
    id,
    props,
  };
};

export const parseNGRPChunk = (view: DataView, chunk: RawChunk): VoxNodeGroup => {
  const {base, length} = chunk;
  const ptr = {offset: base};

  const id = getUint32(view, ptr);
  const props = getDict(view, ptr);

  const n = getUint32(view, ptr);
  const children: number[] = [];
  for (let i = 0; i < n; ++i) children.push(getUint32(view, ptr));
  
  return {
    type: 'group',
    id,
    props,
    children,
  };
};

export const parseNTRNChunk = (view: DataView, chunk: RawChunk): VoxNodeTransform => {
  const {base, length} = chunk;
  const ptr = {offset: base};

  const id = getUint32(view, ptr);
  const props = getDict(view, ptr);

  const child = getUint32(view, ptr);
  const _reserved = getInt32(view, ptr);
  const layer = getInt32(view, ptr);

  const n = getInt32(view, ptr);

  let frame: Float32Array;
  let frames: Float32Array[] | undefined;
  if (n > 1) {
    frames = [];
    for (let i = 0; i < n; ++i) frames.push(decodeTransform(getDict(view, ptr)));
    frame = frames[0];
  }
  else {
    frame = decodeTransform(getDict(view, ptr));
  }

  return {
    type: 'transform',
    id,
    props,
    child,
    layer,
    frame,
    frames,
  };
};

export const parseNSHPChunk = (view: DataView, chunk: RawChunk): VoxNodeShape => {
  const {base, length} = chunk;
  const ptr = {offset: base};

  const id = getUint32(view, ptr);
  const props = getDict(view, ptr);

  const n = getInt32(view, ptr);
  
  let model: VoxMeta;
  let models: VoxMeta[] | undefined;
  if (n > 1) {
    models = [];
    for (let i = 0; i < n; ++i) {
      const id = getUint32(view, ptr);
      const props = getDict(view, ptr);
      models.push({id, props});
    }
    model = models[0];
  }
  else {
    const id = getUint32(view, ptr);
    const props = getDict(view, ptr);
    model = {id, props};
  }

  return {
    type: 'shape',
    id,
    props,
    model,
    models,
  };
};

///////////////////////////////////////////////////////////////////////////////
// Binary parsers
///////////////////////////////////////////////////////////////////////////////

export const getUint8 = (view: DataView, ptr: Pointer): number =>
  view.getUint8(ptr.offset++);

export const getUint32 = (view: DataView, ptr: Pointer): number => {
  const int = view.getUint32(ptr.offset, true);
  ptr.offset += 4;
  return int;
};

export const getInt32 = (view: DataView, ptr: Pointer): number => {
  const int = view.getInt32(ptr.offset, true);
  ptr.offset += 4;
  return int;
};

export const getChunkId = (view: DataView, ptr: Pointer): string =>
  String.fromCharCode(
    view.getUint8(ptr.offset++),
    view.getUint8(ptr.offset++),
    view.getUint8(ptr.offset++),
    view.getUint8(ptr.offset++),
  );

export const getDict = (view: DataView, ptr: Pointer): VoxProps => {
  const n = getUint32(view, ptr);
  if (n === 0) return EMPTY_DICT;

  const dict: VoxProps = {};
  for (let i = 0; i < n; ++i) {
    const key = getString(view, ptr);
    const value = getString(view, ptr);
    dict[key] = value;
  }

  return dict;
};

export const getString = (view: DataView, ptr: Pointer): string => {
  const n = getUint32(view, ptr);

  let chars = [];
  for (let i = 0; i < n; ++i) chars.push(getUint8(view, ptr));
  return String.fromCharCode(...chars);
};
