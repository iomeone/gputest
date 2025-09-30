use '@use-gpu/wgsl/codec/octahedral'::{ decodeOctahedral };

const MAX_HEIGHT = 64;

const CONV_COS0 = 3.1415926536; // π
const CONV_COS1 = 2.09439510239;// π*2/3
const CONV_COS2 = 0.7853981634; // π/4

@link fn getSourceMapping() -> vec4<i32> {};

@link fn getAtlasTexture(uv: vec2<f32>, level: f32) -> vec4<f32>;

@link var<storage, read_write> shCoefficients: array<vec4<f32>>;

const SPECULAR_SH = 0;

var<workgroup> shScratch: array<vec4<f32>, 640>;

@compute @workgroup_size(64, 1)
@export fn pmremDiffuseSH(
  @builtin(global_invocation_id) globalId: vec3<u32>,
) {
  let mapping = getSourceMapping();
  let size = mapping.zw - mapping.xy;

  var band0 = vec4<f32>(0.0);
  var band1 = vec4<f32>(0.0);
  var band2 = vec4<f32>(0.0);
  var band3 = vec4<f32>(0.0);
  var band4 = vec4<f32>(0.0);
  var band5 = vec4<f32>(0.0);
  var band6 = vec4<f32>(0.0);
  var band7 = vec4<f32>(0.0);
  var band8 = vec4<f32>(0.0);
  var bandW = 0.0;

  let s1 = size - 1;

  let x = i32(globalId.x);
  if (x < size.x - 1) {
    for (var y = 0; y < MAX_HEIGHT; y++) {
      if (y >= size.y - 1) { break; }

      let xy = vec2<f32>(vec2<i32>(x, y));
      let uv = (xy + .5) / vec2<f32>(s1);

      // texture starts at uv .5 (absolute coords)
      let uv2 = xy + 1.0 + vec2<f32>(mapping.xy);
      var sample = getAtlasTexture(uv2, 0.0);
      let uvo = uv * 2.0 - 1.0;
      let ray = decodeOctahedral(uvo);

      let dx = (
        decodeOctahedral(uvo + vec2<f32>(1e-4, 0.0)) -
        decodeOctahedral(uvo + vec2<f32>(-1e-4, 0.0))
      ) * 5e3;
      let dy = (
        decodeOctahedral(uvo + vec2<f32>(0.0, 1e-4)) -
        decodeOctahedral(uvo + vec2<f32>(0.0, -1e-4))
      ) * 5e3;

      let weight = length(cross(dx, dy));
      let s = sample * weight;

      // Cap highlights for prebaked SH
      //let s = min(vec4<f32>(2.0), sample) * weight;

      // Test SH alignment
      //let s = weight * vec4<f32>(ray.x, ray.y, ray.z, 1.0);

      // 0-2nd order specular (for SH bake only)
      if (SPECULAR_SH == 1) {
        let ss = s;

        // 0-2nd order specular
        band0 += ss      ;
        band1 += ss *    3 * ray.y; // sqrt(3)
        band2 += ss *    3 * ray.z;
        band3 += ss *    3 * ray.x;
        band4 += ss *   15 * ray.y * ray.x; // sqrt(15)
        band5 += ss *   15 * ray.y * ray.z;
        band6 += ss *  5/4 * (3.0 * sqr(ray.z) - 1.0); // sqrt(5) / 2
        band7 += ss *   15 * ray.x * ray.z;
        band8 += ss * 15/4 * (sqr(ray.x) - sqr(ray.y)); // sqrt(15) / 2
      }
      else if (SPECULAR_SH == 2) {
        let ss = s;

        let xx = sqr(ray.x);
        let yy = sqr(ray.y);
        let zz = sqr(ray.z);

        // 3rd order
        band0 += ss *  7/16 * ray.y * (3 * xx - yy); // sqrt(7)/4
        band1 += ss *   105 * ray.x * ray.y * ray.z; // sqrt(105)
        band2 += ss * 42/16 * ray.y * (5 * zz - 1);  // sqrt(42)/4
        band3 += ss *   7/4 * ray.z * (5 * zz - 3);  // sqrt(7)/2
        band4 += ss * 42/16 * ray.x * (5 * zz - 1);  // sqrt(42)/4
        band5 += ss * 105/4 * ray.z * (xx - yy);     // sqrt(105)/2
        band6 += ss * 70/16 * ray.x * (xx - 3 * yy); // sqrt(70)/4

        // Extra
        //band7 += ss * 11/64    * ray.z * ((63 * zz - 70) * zz + 15);
        //band8 += ss * 1386/256 * ray.y * ((5 * xx - 10 * yy) * xx + yy * yy);
        //band8 += ss * 1386/256 * ray.x * (xx * xx + (5 * yy - 10 * xx) * yy);
      }
      else {
        // 0-2nd order diffuse
        band0 += s        * CONV_COS0;
        band1 += s *  3.0 * CONV_COS1 * ray.y; // sqrt(3)
        band2 += s *  3.0 * CONV_COS1 * ray.z;
        band3 += s *  3.0 * CONV_COS1 * ray.x;
        band4 += s * 15.0 * CONV_COS2 * ray.y * ray.x; // sqrt(15)
        band5 += s * 15.0 * CONV_COS2 * ray.y * ray.z;
        band6 += s * 1.25 * CONV_COS2 * (3.0 * sqr(ray.z) - 1.0); // sqrt(5) / 2
        band7 += s * 15.0 * CONV_COS2 * ray.x * ray.z;
        band8 += s * 3.75 * CONV_COS2 * (sqr(ray.x) - sqr(ray.y)); // sqrt(15) / 2
      }

      bandW += weight;
    }

    let index = x * 10;
    shScratch[index + 0] = band0;
    shScratch[index + 1] = band1;
    shScratch[index + 2] = band2;
    shScratch[index + 3] = band3;
    shScratch[index + 4] = band4;
    shScratch[index + 5] = band5;
    shScratch[index + 6] = band6;
    shScratch[index + 7] = band7;
    shScratch[index + 8] = band8;
    shScratch[index + 9] = vec4<f32>(bandW, 0.0, 0.0, 0.0);
  }

  workgroupBarrier();

  if (x > 0) { return; }

  for (var x = 1; x < size.x - 1; x++) {
    let index = x * 10;
    band0 += shScratch[index + 0];
    band1 += shScratch[index + 1];
    band2 += shScratch[index + 2];
    band3 += shScratch[index + 3];
    band4 += shScratch[index + 4];
    band5 += shScratch[index + 5];
    band6 += shScratch[index + 6];
    band7 += shScratch[index + 7];
    band8 += shScratch[index + 8];
    bandW += shScratch[index + 9].x;
  }

  let norm = 1 / bandW;
  shCoefficients[0] = band0 * norm;
  shCoefficients[1] = band1 * norm;
  shCoefficients[2] = band2 * norm;
  shCoefficients[3] = band3 * norm;
  shCoefficients[4] = band4 * norm;
  shCoefficients[5] = band5 * norm;
  shCoefficients[6] = band6 * norm;
  shCoefficients[7] = band7 * norm;
  shCoefficients[8] = band8 * norm;
}

fn sqr(x: f32) -> f32 { return x * x; }
