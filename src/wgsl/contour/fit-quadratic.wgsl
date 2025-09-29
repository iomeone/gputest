use '@use-gpu/wgsl/use/array'::{ sizeToModulus3, packIndex3, unpackIndex3 };
use './types'::{ IndirectDrawMeta };
use './solve'::{ approx3x3 };

@link var<storage, read_write> indirectDraw: IndirectDrawMeta;
@link var<storage, read_write> activeCells: array<u32>;
@link var<storage, read_write> vertexPositions: array<vec4<f32>>;
@link var<storage, read_write> vertexNormals: array<vec4<f32>>;

@link fn getValueData(i: u32) -> f32 {};
@link fn getNormalData(i: u32) -> vec3<f32> {};
@link fn getVolumeSize() -> vec3<u32> {};
@optional @link fn getVolumeLevel() -> f32 { return 0.0; };

fn getZeroLevel(a: f32, b: f32) -> f32 {
  return -a / (b - a);
};

@compute @workgroup_size(64)
@export fn main(
  @builtin(global_invocation_id) globalId: vec3<u32>,
) {
  let size = getVolumeSize();
  let level = getVolumeLevel();
  let modulus = sizeToModulus3(size);

  let index = globalId.x;
  if (index >= indirectDraw.nextVertexIndex) { return; }

  let cellIndex = activeCells[index];
  let cellOrigin = vec3<f32>(unpackIndex3(cellIndex, modulus));

  let i000 = cellIndex;
  let i100 = cellIndex + packIndex3(vec3<u32>(1u, 0u, 0u), modulus);
  let i010 = cellIndex + packIndex3(vec3<u32>(0u, 1u, 0u), modulus);
  let i001 = cellIndex + packIndex3(vec3<u32>(0u, 0u, 1u), modulus);
  let i110 = cellIndex + packIndex3(vec3<u32>(1u, 1u, 0u), modulus);
  let i011 = cellIndex + packIndex3(vec3<u32>(0u, 1u, 1u), modulus);
  let i101 = cellIndex + packIndex3(vec3<u32>(1u, 0u, 1u), modulus);
  let i111 = cellIndex + packIndex3(vec3<u32>(1u, 1u, 1u), modulus);

  let p000 = getValueData(i000) - level;
  let p100 = getValueData(i100) - level;
  let p010 = getValueData(i010) - level;
  let p001 = getValueData(i001) - level;
  let p110 = getValueData(i110) - level;
  let p011 = getValueData(i011) - level;
  let p101 = getValueData(i101) - level;
  let p111 = getValueData(i111) - level;

  var ata1 = vec3<f32>(0.0);
  var ata2 = vec3<f32>(0.0);
  var atb  = vec3<f32>(0.0);

  var p = vec3<f32>(0.0);
  var w = 0.0;

  var nx = vec3<f32>(0.0);
  var ny = vec3<f32>(0.0);
  var nz = vec3<f32>(0.0);
  
  if (p000 * p100 < 0.0) {
    var f = getZeroLevel(p000, p100);

    let n1 = getNormalData(i000).xyz;
    let n2 = getNormalData(i100).xyz;

    var pb = vec3<f32>(f, 0.0, 0.0) - 0.5;
    if (dot(n1, n2) < 0.125) {
      if (abs(n1.x) > abs(n2.x)) { f = 0; }
      else { f = 1; }
    }
    var pn = mix(n1, n2, f);
    
    ata1 += pn * pn;
    ata2 += pn * pn.yzx;
    atb  += dot(pn, pb) * pn;

    p += pb;
    nx += pn;
    w += 1.0;
  }

  if (p000 * p010 < 0.0) {
    var f = getZeroLevel(p000, p010);

    let n1 = getNormalData(i000).xyz;
    let n2 = getNormalData(i010).xyz;

    var pb = vec3<f32>(0.0, f, 0.0) - 0.5;
    if (dot(n1, n2) < 0.125) {
      if (abs(n1.y) > abs(n2.y)) { f = 0; }
      else { f = 1; }
    }
    var pn = mix(n1, n2, f);
    
    ata1 += pn * pn;
    ata2 += pn * pn.yzx;
    atb  += dot(pn, pb) * pn;

    p += pb;
    ny += pn;
    w += 1.0;
  }

  if (p000 * p001 < 0.0) {
    var f = getZeroLevel(p000, p001);

    let n1 = getNormalData(i000).xyz;
    let n2 = getNormalData(i001).xyz;

    var pb = vec3<f32>(0.0, 0.0, f) - 0.5;
    if (dot(n1, n2) < 0.125) {
      if (abs(n1.z) > abs(n2.z)) { f = 0; }
      else { f = 1; }
    }
    var pn = mix(n1, n2, f);

    ata1 += pn * pn;
    ata2 += pn * pn.yzx;
    atb  += dot(pn, pb) * pn;

    p += pb;
    nz += pn;
    w += 1.0;
  }

  if (p100 * p110 < 0.0) {
    var f = getZeroLevel(p100, p110);

    let n1 = getNormalData(i100).xyz;
    let n2 = getNormalData(i110).xyz;

    var pb = vec3<f32>(1.0, f, 0.0) - 0.5;
    if (dot(n1, n2) < 0.125) {
      if (abs(n1.y) > abs(n2.y)) { f = 0; }
      else { f = 1; }
    }
    var pn = mix(n1, n2, f);

    ata1 += pn * pn;
    ata2 += pn * pn.yzx;
    atb  += dot(pn, pb) * pn;

    p += pb;
    ny += pn;
    w += 1.0;
  }

  if (p100 * p101 < 0.0) {
    var f = getZeroLevel(p100, p101);

    let n1 = getNormalData(i100).xyz;
    let n2 = getNormalData(i101).xyz;

    var pb = vec3<f32>(1.0, 0.0, f) - 0.5;
    if (dot(n1, n2) < 0.125) {
      if (abs(n1.z) > abs(n2.z)) { f = 0; }
      else { f = 1; }
    }
    var pn = mix(n1, n2, f);

    ata1 += pn * pn;
    ata2 += pn * pn.yzx;
    atb  += dot(pn, pb) * pn;

    p += pb;
    nz += pn;
    w += 1.0;
  }

  if (p010 * p110 < 0.0) {
    var f = getZeroLevel(p010, p110);

    let n1 = getNormalData(i010).xyz;
    let n2 = getNormalData(i110).xyz;

    var pb = vec3<f32>(f, 1.0, 0.0) - 0.5;
    if (dot(n1, n2) < 0.125) {
      if (abs(n1.x) > abs(n2.x)) { f = 0; }
      else { f = 1; }
    }
    var pn = mix(n1, n2, f);

    ata1 += pn * pn;
    ata2 += pn * pn.yzx;
    atb  += dot(pn, pb) * pn;

    p += pb;
    nx += pn;
    w += 1.0;
  }

  if (p010 * p011 < 0.0) {
    var f = getZeroLevel(p010, p011);

    let n1 = getNormalData(i010).xyz;
    let n2 = getNormalData(i011).xyz;

    var pb = vec3<f32>(0.0, 1.0, f) - 0.5;
    if (dot(n1, n2) < 0.125) {
      if (abs(n1.z) > abs(n2.z)) { f = 0; }
      else { f = 1; }
    }
    var pn = mix(n1, n2, f);

    ata1 += pn * pn;
    ata2 += pn * pn.yzx;
    atb  += dot(pn, pb) * pn;

    p += pb;
    nz += pn;
    w += 1.0;
  }

  if (p001 * p101 < 0.0) {
    var f = getZeroLevel(p001, p101);

    let n1 = getNormalData(i001).xyz;
    let n2 = getNormalData(i101).xyz;

    var pb = vec3<f32>(f, 0.0, 1.0) - 0.5;
    if (dot(n1, n2) < 0.125) {
      if (abs(n1.x) > abs(n2.x)) { f = 0; }
      else { f = 1; }
    }
    var pn = mix(n1, n2, f);

    ata1 += pn * pn;
    ata2 += pn * pn.yzx;
    atb  += dot(pn, pb) * pn;

    p += pb;
    nx += pn;
    w += 1.0;
  }

  if (p001 * p011 < 0.0) {
    var f = getZeroLevel(p001, p011);

    let n1 = getNormalData(i001).xyz;
    let n2 = getNormalData(i011).xyz;

    var pb = vec3<f32>(0.0, f, 1.0) - 0.5;
    if (dot(n1, n2) < 0.125) {
      if (abs(n1.y) > abs(n2.y)) { f = 0; }
      else { f = 1; }
    }
    var pn = mix(n1, n2, f);

    ata1 += pn * pn;
    ata2 += pn * pn.yzx;
    atb  += dot(pn, pb) * pn;

    p += pb;
    ny += pn;
    w += 1.0;
  }

  if (p011 * p111 < 0.0) {
    var f = getZeroLevel(p011, p111);

    let n1 = getNormalData(i011).xyz;
    let n2 = getNormalData(i111).xyz;

    var pb = vec3<f32>(f, 1.0, 1.0) - 0.5;
    if (dot(n1, n2) < 0.125) {
      if (abs(n1.x) > abs(n2.x)) { f = 0; }
      else { f = 1; }
    }
    var pn = mix(n1, n2, f);

    ata1 += pn * pn;
    ata2 += pn * pn.yzx;
    atb  += dot(pn, pb) * pn;

    p += pb;
    nx += pn;
    w += 1.0;
  }

  if (p101 * p111 < 0.0) {
    var f = getZeroLevel(p101, p111);

    let n1 = getNormalData(i101).xyz;
    let n2 = getNormalData(i111).xyz;

    var pb = vec3<f32>(1.0, f, 1.0) - 0.5;
    if (dot(n1, n2) < 0.125) {
      if (abs(n1.y) > abs(n2.y)) { f = 0; }
      else { f = 1; }
    }
    var pn = mix(n1, n2, f);

    ata1 += pn * pn;
    ata2 += pn * pn.yzx;
    atb  += dot(pn, pb) * pn;

    p += pb;
    ny += pn;
    w += 1.0;
  }

  if (p110 * p111 < 0.0) {
    var f = getZeroLevel(p110, p111);

    let n1 = getNormalData(i110).xyz;
    let n2 = getNormalData(i111).xyz;

    var pb = vec3<f32>(1.0, 1.0, f) - 0.5;
    if (dot(n1, n2) < 0.125) {
      if (abs(n1.z) > abs(n2.z)) { f = 0; }
      else { f = 1; }
    }
    var pn = mix(n1, n2, f);

    ata1 += pn * pn;
    ata2 += pn * pn.yzx;
    atb  += dot(pn, pb) * pn;

    p += pb;
    nz += pn;
    w += 1.0;
  }

  var system = mat3x4<f32>(
    ata1.x, ata2.x, ata2.z, atb.x,
    ata2.x, ata1.y, ata2.y, atb.y,
    ata2.z, ata2.y, ata1.z, atb.z,
  );
  let pos = approx3x3(system);
  
  nx = normalize(nx);
  ny = normalize(ny);
  nz = normalize(nz);

  let dxy = dot(nx, ny) > 0.707;
  let dyz = dot(ny, nz) > 0.707;
  let dzx = dot(nz, nx) > 0.707;
  if ((dxy && dyz) || (dxy && dzx) || (dyz && dzx)) {
    let n = normalize(nx + ny + nz);
    nx = n;
    ny = n;
    nz = n;
  }
  else {
    if (dxy) {
      let n = normalize(nx + ny);
      nx = n;
      ny = n;
    }
    if (dyz) {
      let n = normalize(ny + nz);
      ny = n;
      nz = n;
    }
    if (dzx) {
      let n = normalize(nz + nx);
      nz = n;
      nx = n;
    }
  }

  vertexPositions[index] = vec4<f32>(cellOrigin + pos + 0.5, 1.0);
  vertexNormals[index * 3] = vec4<f32>(nx, 1.0);
  vertexNormals[index * 3 + 1] = vec4<f32>(ny, 1.0);
  vertexNormals[index * 3 + 2] = vec4<f32>(nz, 1.0);
}
