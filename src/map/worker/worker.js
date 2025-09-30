import { expose } from 'comlink';
import { VectorTile } from 'mapbox-vector-tile';
import { getMVTShapes, aggregateMVTShapes } from '../util/mvtile';

const loadMVT = async (x, y, zoom, url, styles, flipY, tesselate) => {
  const res = await fetch(url);
  let ab = await res.arrayBuffer();

  // MVT may be gzipped
  const bytes = new Uint8Array(ab);
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
    const gunzip = new DecompressionStream('gzip');
    const stream = new Blob([ab]).stream().pipeThrough(gunzip);
    ab = await new Response(stream).arrayBuffer();
  }

  // Load raw MVT
  const mvt = new VectorTile(new Uint8Array(ab));
  const shapes = getMVTShapes(x, y, zoom, mvt, styles, flipY, tesselate);
  const aggregate = aggregateMVTShapes(shapes);

  return aggregate;
}

expose({ loadMVT });