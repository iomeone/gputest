import { expose } from 'comlink';
import Protobuf from 'pbf';
import { VectorTile } from '@mapbox/vector-tile';
import { getMVTShapes, aggregateMVTShapes } from '../util/mvtile';

const loadMVT = async (x, y, zoom, url, options, styles, locale, tesselate, flipY) => {
  const res = await fetch(url, options);
  if (res.status !== 200) return {};

  let ab = await res.arrayBuffer();

  // MVT may be gzipped
  const bytes = new Uint8Array(ab);
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
    const gunzip = new DecompressionStream('gzip');
    const stream = new Blob([ab]).stream().pipeThrough(gunzip);
    ab = await new Response(stream).arrayBuffer();
  }

  // Load raw MVT
  try {
    const mvt = new VectorTile(new Protobuf(ab));
    const shapes = getMVTShapes(x, y, zoom, mvt, styles, locale, tesselate, flipY);
    const aggregate = aggregateMVTShapes(shapes);
    return aggregate;
  } catch (e) {
    console.warn(e);
    return {};
  }

}

expose({ loadMVT });