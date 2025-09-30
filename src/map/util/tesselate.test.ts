import { cutPolygons, cutPolygon, cutRing, assembleCutRing, getRingArea, pointInRing } from './tesselate';

describe("tesselate", () => {

  it("cuts ring left", () => {

    const ring = [
      [  0,   0],
      [100,   0],
      [100, 100],
      [  0, 100],
    ];

    const nx = 1;
    const ny = 0;
    const d = 50;

    const cut = cutRing(ring, nx, ny, d);
    expect(cut).toMatchSnapshot();
  });

  it("cuts ring right", () => {

    const ring = [
      [  0,   0],
      [100,   0],
      [100, 100],
      [  0, 100],
    ];

    const nx = -1;
    const ny = 0;
    const d = -50;

    const cut = cutRing(ring, nx, ny, d);
    expect(cut).toMatchSnapshot();

  });

  it("cuts ring on vertex left", () => {

    const ring = [
      [  0,   0],
      [ 50,   0],
      [100,   0],
      [100, 100],
      [ 50, 100],
      [  0, 100],
    ];

    const nx = 1;
    const ny = 0;
    const d = 50;

    const cut = cutRing(ring, nx, ny, d);
    expect(cut).toMatchSnapshot();
  });

  it("cuts ring on vertex right", () => {

    const ring = [
      [  0,   0],
      [ 50,   0],
      [100,   0],
      [100, 100],
      [ 50, 100],
      [  0, 100],
    ];

    const nx = -1;
    const ny = 0;
    const d = -50;

    const cut = cutRing(ring, nx, ny, d);
    expect(cut).toMatchSnapshot();
  });

  it("cuts U", () => {

    const ring = [
      [  0,   0],
      [100,   0],
      [100,  25],
      [ 25,  25],
      [ 25,  75],
      [100,  75],
      [100, 100],
      [  0, 100],
    ];

    const nx = 1;
    const ny = 0;
    const d = 50;

    const cut = cutRing(ring, nx, ny, d);
    expect(cut).toMatchSnapshot();

  });

  it("cuts U left with multiple vertices on edge", () => {

    const ring = [
      [  0,   0],
      [ 50,   0],
      [ 50,  10],
      [ 50,  25],
      [ 25,  25],
      [ 25,  75],
      [100,  75],
      [100, 100],
      [  0, 100],
    ];

    const nx = 1;
    const ny = 0;
    const d = 50;

    const cut = cutRing(ring, nx, ny, d);
    expect(cut).toMatchSnapshot();

  });

  it("cuts U right with multiple vertices on edge", () => {

    const ring = [
      [  0,   0],
      [ 50,   0],
      [ 50,  10],
      [ 50,  25],
      [ 25,  25],
      [ 25,  75],
      [100,  75],
      [100, 100],
      [  0, 100],
    ];

    const nx = 1;
    const ny = 0;
    const d = 50;

    const cut = cutRing(ring, nx, ny, d);
    expect(cut).toMatchSnapshot();

  });

  it("assembles U pieces", () => {

    const ring = [
      [  0,   0],
      [100,   0],
      [100,  25],
      [ 25,  25],
      [ 25,  75],
      [100,  75],
      [100, 100],
      [  0, 100],
    ];

    const nx = 1;
    const ny = 0;
    const d = 50;

    const cut = cutRing(ring, nx, ny, d);
    const polygon = assembleCutRing(cut, nx, ny);

    expect(polygon.map(getRingArea)).toMatchSnapshot();
    expect(polygon).toMatchSnapshot();

  });

  it("assembles U piece left", () => {

    const ring = [
      [  0,   0],
      [100,   0],
      [100,  25],
      [ 25,  25],
      [ 25,  75],
      [100,  75],
      [100, 100],
      [  0, 100],
    ];

    const nx = -1;
    const ny = 0;
    const d = -50;

    const cut = cutRing(ring, nx, ny, d);

    const polygon = assembleCutRing(cut, nx, ny);
    expect(polygon.map(getRingArea)).toMatchSnapshot();
    expect(polygon).toMatchSnapshot();

  });

  it("assembles U piece right", () => {

    const ring = [
      [100,   0],
      [  0,   0],
      [  0,  25],
      [ 75,  25],
      [ 75,  75],
      [  0,  75],
      [  0, 100],
      [100, 100],
    ];

    const nx = 1;
    const ny = 0;
    const d = 50;

    const cut = cutRing(ring, nx, ny, d);

    const polygon = assembleCutRing(cut, nx, ny);
    expect(polygon.map(getRingArea)).toMatchSnapshot();
    expect(polygon).toMatchSnapshot();

  });

  it("assembles spiral piece", () => {

    const ring = [
      [  0,   0],
      [100,   0],
      [100, 100],
      [  0, 100],
      [  0,  25],
      [ 75,  25],
      [ 75,  75],
      [ 25,  75],
      [ 25,  50],
      [ 60,  50],
      [ 60,  55],
      [ 30,  55],
      [ 30,  70],
      [ 70,  70],
      [ 70,  30],
      [  5,  30],
      [  5,  95],
      [ 95,  95],
      [ 95,   5],
      [  0,   5],
    ];

    const nx = 1;
    const ny = 0;
    const d = 50;

    const cut = cutRing(ring, nx, ny, d);

    const polygon = assembleCutRing(cut, nx, ny);
    expect(polygon.map(getRingArea)).toMatchSnapshot();
    expect(polygon).toMatchSnapshot();

  });

  it("assembles complex piece", () => {

    const rings = [
      [
        [  0,   0],
        [100,   0],
        [100, 100],
        [  0, 100],
        [  0,  25],
        [ 75,  25],
        [ 75,  75],
        [ 25,  75],
        [ 25,  50],
        [ 60,  50],
        [ 60,  55],
        [ 30,  55],
        [ 30,  70],
        [ 70,  70],
        [ 70,  30],
        [  5,  30],
        [  5,  95],
        [ 95,  95],
        [ 95,   5],
        [  0,   5],
      ],
      [
        [45, 51],
        [45, 52],
        [55, 52],
        [55, 51],
      ],
      [
        [45, 53],
        [45, 54],
        [55, 54],
        [55, 53],
      ],
      [
        [45, 1],
        [45, 4],
        [55, 4],
        [55, 1],
      ],
      [
        [54, 2],
        [54, 3],
        [46, 3],
        [46, 2],
      ],
    ];

    const nx = 1;
    const ny = 0;
    const d = 50;

    const cut = rings.flatMap(r => cutRing(r, nx, ny, d));
    const polygon = assembleCutRing(cut, nx, ny);

    expect(polygon.map(getRingArea)).toMatchSnapshot();
    expect(polygon).toMatchSnapshot();

  });

  it('cut polygon', () => {
    const rings = [
      [
        [10, 10],
        [50, 10],
        [40, 40],
        [10, 50],
      ],
      [
        [20, 20],
        [20, 25],
        [25, 25],
        [25, 20],
      ],
    ];

    const nx = 1;
    const ny = 0;
    const d = 22;

    const polygons = cutPolygon(rings, nx, ny, d);

    expect(polygons.map(polygon => polygon.map(getRingArea))).toMatchSnapshot();
    expect(polygons).toMatchSnapshot();

  });

  it('cut polygon beside hole', () => {
    const rings = [
      [
        [10, 10],
        [50, 10],
        [40, 40],
        [10, 50],
      ],
      [
        [20, 20],
        [20, 25],
        [25, 25],
        [25, 20],
      ],
      [
        [18, 20],
        [18, 25],
        [19, 25],
        [19, 20],
      ],
      [
        [16, 20],
        [16, 25],
        [17, 25],
        [17, 20],
      ],
    ];

    const nx = 1;
    const ny = 0;
    const d = 12;

    const polygons = cutPolygon(rings, nx, ny, d);

    expect(polygons.map(polygon => polygon.map(getRingArea))).toMatchSnapshot();
    expect(polygons).toMatchSnapshot();

  });

  it('point in ring', () => {
    const ring = [
      [1, 1],
      [4, 1],
      [3, 3],
      [1, 2],
    ];

    expect(pointInRing(ring, [1.5, 1.5])).toBe(true);
    expect(pointInRing(ring, [-1.5, 1.5])).toBe(false);
  });

  it('does not insert duplicate vertices', () => {
    let polygons = [[[[0, 0], [10, 0], [10, 10], [0, 10]]]];

    const hasAnyDuplicates = (polygons: XY[][][]) => {
      for (const poly of polygons) for (const ring of poly) if (hasDuplicates(ring)) return true;
      return false;
    };

    const hasDuplicates = (ring: XY[]) => {
      const n = ring.length - 1;
      for (let i = 0; i < n; ++i) {
        const a = ring[i];
        const b = ring[i + 1];
        if (a[0] === b[0] && a[1] === b[1]) return true;
      }
      return false;
    }
    
    polygons = cutPolygons(polygons, 1, 0, 0);
    expect(polygons && hasAnyDuplicates(polygons)).toBe(false);
    expect(polygons).toMatchSnapshot();

    polygons = cutPolygons(polygons, 0, 1, 0);
    expect(polygons && hasAnyDuplicates(polygons)).toBe(false);
    expect(polygons).toMatchSnapshot();
  });

});
