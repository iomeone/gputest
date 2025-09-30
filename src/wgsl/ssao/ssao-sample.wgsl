use '../../wgsl/codec/normal16'::{ decodeNormal16 };
use '../../wgsl/fragment/bayer'::{ bayer4x4 };
use '../../wgsl/fragment/noise'::{ IGN };
use '../../wgsl/use/view'::{ worldToView, clipToView, viewToClip, viewToWorld, clipXYToUV, clipUVToXY, to3D, getViewPixelRatio };

@link fn loadNormal16(xy: vec2<u32>) -> vec4<u32>;
@link fn loadDepth(xy: vec2<u32>) -> f32;

@link fn getOverscanSize() -> vec2<f32>;
@link fn getDownsampleSize() -> vec2<f32>;
@link fn getJitterXY() -> vec2<u32>;

@link fn getRadius() -> f32;
@link fn getFrame() -> u32;

@optional @link fn getPick() -> vec2<i32> { return vec2<i32>(-1); };
@optional @link fn printPoint(position: vec4<f32>, color: vec4<f32>) { };
@optional @link fn printLine(start: vec4<f32>, end: vec4<f32>, color: vec4<f32>) { };
@optional @link fn printData(vector: vec4<f32>) { };

// Based on: Practical Realtime Strategies for Accurate Indirect Occlusion (GTAO)
// Jorge Jimenez et al.

const BLEND_THICKNESS = 0.25;
const MAX_RADIUS = 0.5;
const SAMPLES = 8;

const PHI_1 = 0.61803398875;

const PHI_2_1 = 0.7548776662;
const PHI_2_2 = 0.5698402910;

const PI = 3.1415926536;
const PI_2 = 1.5707963268;

fn projectOnDirection(da: vec2<f32>, v: vec3<f32>) -> vec2<f32> {
  return vec2<f32>(dot(da, v.xy), v.z);
}

fn projectOnPlane(n: vec3<f32>, v: vec3<f32>) -> vec3<f32> {
  let d = dot(n, v);
  return v - d * n;
}

fn blendThickness(a: f32, b: f32) -> f32 { return mix(a, b, BLEND_THICKNESS); }

fn updateCosTheta(accum: f32, current: f32, last: f32) -> f32 {
  //return select(blendThickness(accum, current), max(accum, current), current >= last);
  return select(blendThickness(last, current), max(accum, current), current >= last);
}

fn acos1(x: f32) -> f32 {
  return acos(clamp(x, -1.0, 1.0));
}

fn slerpAngle(a: vec3<f32>, b: vec3<f32>, angle: f32) -> vec3<f32> {
  let arc = acos1(dot(a, b));
  let t = angle / arc;
  return (sin((1.0 - t) * arc) * a + sin(t * arc) * b) / sin(arc);
}

@export fn getSSAOSample(uv: vec2<f32>) -> vec4<f32> {

  // Convert downsampled + jittered UV to full size UV
  let jitterXY = getJitterXY();
  let sampleXY = vec2<u32>(uv * getDownsampleSize());
  let sourceXY = sampleXY * 2 + jitterXY;
  let sourceUV = vec2<f32>(sourceXY) / getOverscanSize();

  // Load normal and convert to view-space
  let worldNormal = decodeNormal16(loadNormal16(sampleXY));
  let normal = normalize(worldToView(vec4<f32>(worldNormal, 0.0)).xyz);

  // Bail (non-uniform control flow)
  let clipDepth = loadDepth(sampleXY) * 0.99999;
  if (clipDepth == 0.0) { return vec4<f32>(0.0, 0.0, 0.0, 1.0); }

  // Reconstruct view-space position from clip XY + depth
  let clipXY = clipUVToXY(sourceUV);
  let clip = vec4<f32>(clipXY, clipDepth, 1.0);

  let position = to3D(clipToView(clip));

  // Get view vector + effective sampling radius
  let view = -normalize(position);
  let radius = min(MAX_RADIUS * abs(position.z) / getViewPixelRatio(), getRadius());

  let inv = 1.0 / f32(SAMPLES);
  let nramp = SAMPLES / 2;

  // Angle + radius dithering / jittering
  let ij = sourceXY;
  let f = getFrame();
  let quasi = (PHI_1 * f32(f)) % 1.0;
  let quasi2 = (vec2<f32>(PHI_2_1, PHI_2_2) * vec2<f32>(ij)) % 1.0;

  let ditherAngle = IGN(ij, f);
  let spinAngle = 0.0;//quasi1;
  let jitterSample = quasi;//(quasi2.x*quasi2.y*1611.171) % 1.0;

  let angle = ((ditherAngle + spinAngle) % 1.0) * 3.141592;

  // Sample direction
  let c = cos(angle);
  let s = sin(angle);
  let da = vec2<f32>(c, s);

  // Clip-space radius (ellipse)
  let clipDR = (to3D(viewToClip(vec4<f32>(position + vec3<f32>(da * radius, 0.0), 1.0))).xy - clip.xy);

  // Project normal/view into view/tangent plane
  let plane = normalize(cross(vec3<f32>(da, 0.0), view));
  let nproj = projectOnPlane(plane, normal);
  let vproj = normalize(projectOnDirection(da, view));

  // Debug logger / point picker
  let pick = getPick();
  let log = HAS_DEBUG_PICKING & (i32(ij.x) == pick.x && i32(ij.y) == pick.y);
  if (HAS_DEBUG_PICKING && log) {
    printPoint(viewToWorld(vec4<f32>(position, 1.0)), vec4<f32>(1.0));
  }

  // Accumulate cosine(theta) horizon angles
  var cth1 = -1.0;
  var cth2 = -1.0;
  var lcths1 = 0.0;
  var lcths2 = 0.0;

  for (var i = 1; i <= SAMPLES; i++) {
    // Linear radius and (1 - weight) fall-off curve
    let df = (f32(i) - jitterSample) * inv;
    let df3 = df*df*df;

    // Equal and opposite sample pair
    let ds = clipDR * df;
    let clip1 = clip.xy + ds;
    let clip2 = clip.xy - ds;

    // Map clip XY + depth to view space
    let uv1 = clipXYToUV(clip1);
    let uv2 = clipXYToUV(clip2);

    // Jitter can be ignored here if <1 texel because of nearest sampling
    let xy1 = vec2<u32>(uv1 * getDownsampleSize());
    let xy2 = vec2<u32>(uv2 * getDownsampleSize());

    let d1 = loadDepth(xy1);
    let d2 = loadDepth(xy2);

    var s1 = to3D(clipToView(vec4<f32>(clip1, d1, 1.0)));
    var s2 = to3D(clipToView(vec4<f32>(clip2, d2, 1.0)));

    if (HAS_DEBUG_PICKING && log) {
      printLine(viewToWorld(vec4<f32>(position, 1.0)), viewToWorld(vec4<f32>(s1, 1.0)), vec4<f32>(0.3, 0.75, 1.0, 1.0));
      printLine(viewToWorld(vec4<f32>(position, 1.0)), viewToWorld(vec4<f32>(s2, 1.0)), vec4<f32>(0.6, 0.75, 1.0, 1.0));
    }

    // Get cosine of horizon angles relative to view direction
    let os1 = normalize(projectOnDirection(da, s1 - position));
    let os2 = normalize(projectOnDirection(da, s2 - position));

    let cths1 = dot(os1, vproj);
    let cths2 = dot(os2, vproj);

    // Hard edge
    //cth1 = max(cth1, cths1);
    //cth2 = max(cth2, cths2);

    // Accumulate with fall-off curve
    cth1 = mix(updateCosTheta(cth1, cths1, lcths1), cth1, df3);
    cth2 = mix(updateCosTheta(cth2, cths2, lcths2), cth2, df3);

    lcths1 = cths1;
    lcths2 = cths2;
  }

  // In-plane normal angle + integral correction
  let gamma = acos1(dot(normalize(nproj), view)) * sign(dot(plane, cross(nproj, view)));
  let lnproj = length(nproj);

  // Get horizon angles
  let acth1 = acos1(cth1);
  let acth2 = -acos1(cth2);
  let th1 = gamma + clamp(acth1 - gamma, -PI_2, PI_2);
  let th2 = gamma + clamp(acth2 - gamma, -PI_2, PI_2);

  // Integrate view->horizon arcs
  let cg = cos(gamma);
  let sg = sin(gamma);
  let thv2 = 2.0 * vec2<f32>(th1, th2);
  let slice = cg / lnproj + thv2 * sg - cos(thv2 - gamma);
  let visibility = 0.25 * lnproj * (slice.x + slice.y);

  // Estimate bent normal
  let up = normal;
  let upProj = normalize(nproj);
  let side = vec3<f32>(da, 0.0);
  let halfAngle = (th1 + th2) / 2.0 - gamma;
  let bentNormal = slerpAngle(up, side, halfAngle);
  let worldBentNormal = viewToWorld(vec4<f32>(bentNormal, 0.0)).xyz;

  // Visualize sampling arcs
  if (HAS_DEBUG_PICKING && log) {
    let angle1 = th1 - gamma;
    let angle2 = th2 - gamma;
    for (var i = 0; i < 16; i++) {
      let pos1 = position + radius * 0.5 * slerpAngle(upProj, side, mix(angle1, angle2, f32(i)/16.0));
      let pos2 = position + radius * 0.5 * slerpAngle(upProj, side, mix(angle1, angle2, f32(i+1)/16.0));
      printLine(
        viewToWorld(vec4<f32>(pos1, 1.0)),
        viewToWorld(vec4<f32>(pos2, 1.0)),
        vec4<f32>(0.5, 1.2, 0.5, 1.0)
      );
    }

    printLine(
      viewToWorld(vec4<f32>(position, 1.0)),
      viewToWorld(vec4<f32>(position + bentNormal, 1.0)),
      vec4<f32>(1.0, 0.0, 0.0, 1.0)
    );

    printLine(
      viewToWorld(vec4<f32>(position, 1.0)),
      viewToWorld(vec4<f32>(position + bentNormal, 1.0)),
      vec4<f32>(1.0, 1.2, 0.0, 1.0)
    );

    /*
    printLine(
      viewToWorld(vec4<f32>(position, 1.0)),
      viewToWorld(vec4<f32>(position + view, 1.0)),
      vec4<f32>(1.0, 0.8, 0.0, 1.0)
    );

    printLine(
      viewToWorld(vec4<f32>(position, 1.0)),
      viewToWorld(vec4<f32>(position + side, 1.0)),
      vec4<f32>(0.3, 1.0, 0.3, 1.0)
    );

    */
  }

  // Unorm [0..1] encoding for normal
  let sample = vec4<f32>(worldBentNormal * .5 + .5, visibility);
  return sample;
}
