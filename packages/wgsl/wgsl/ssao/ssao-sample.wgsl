use '@use-gpu/wgsl/codec/normal16'::{ decodeNormal16 };
use '@use-gpu/wgsl/fragment/bayer'::{ bayer4x4 };
use '@use-gpu/wgsl/fragment/noise'::{ IGN };
use '@use-gpu/wgsl/use/view'::{ worldToView, clipToView, viewToClip, viewToWorld, clipXYToUV, clipUVToXY, to3D, getAbsoluteScale };

@link fn getNormal16(uv: vec2<f32>) -> vec4<u32>;
@link fn getDepth(uv: vec2<f32>) -> f32;

@link fn getRadius() -> f32;
@link fn getSize() -> vec2<f32>;
@link fn getFrame() -> u32;

@optional @link fn getPick() -> vec2<u32> { return vec2<u32>(-1); };
@optional @link fn printPoint(position: vec3<f32>, color: vec3<f32>) { };
@optional @link fn printLine(start: vec3<f32>, end: vec3<f32>, color: vec3<f32>) { };
@optional @link fn printData(vector: vec4<f32>) { };

const BLEND_THICKNESS = 0.25;
const MAX_RADIUS = 0.5;
const SAMPLES = 8;

const PHI_1 = 0.61803398875;

const PHI_2_1 = 0.7548776662;
const PHI_2_2 = 0.5698402910;

fn projectOnDirection(da: vec2<f32>, v: vec3<f32>) -> vec2<f32> {
  return vec2<f32>(dot(da, v.xy), v.z);
}

fn projectOnPlane(n: vec3<f32>, v: vec3<f32>) -> vec3<f32> {
  let d = dot(n, v);
  return v - d * n;
}

fn blendThickness(a: f32, b: f32) -> f32 { return mix(a, b, BLEND_THICKNESS); }

fn updateCosTheta(accum: f32, current: f32, last: f32) -> f32 {
  return select(blendThickness(accum, current), max(accum, current), current >= last);
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

  // Convert normal to view-space
  let worldNormal = decodeNormal16(getNormal16(uv).xy);  
  let normal = worldToView(vec4<f32>(worldNormal, 0.0)).xyz;

  // Bail (non-uniform control flow)
  let clipDepth = getDepth(uv);
  if (clipDepth == 0.0) { return vec4<f32>(0.0, 0.0, 0.0, 1.0); }

  // Reconstruct view-space position from depth
  let clipXY = clipUVToXY(uv);
  let clip = vec4<f32>(clipXY, clipDepth, 1.0);

  let position = to3D(clipToView(clip));

  // Get view vector + effective sampling radius
  let view = -normalize(position);
  let radius = min(MAX_RADIUS * abs(position.z) / getAbsoluteScale(), getRadius());

  let inv = 1.0 / f32(SAMPLES);
  let nramp = SAMPLES / 2;

  // Angle + sample dithering / jittering  
  let ij = vec2<u32>(uv * getSize());
  let f = getFrame();
  let quasi = (PHI_1 * f32(f)) % 1.0;
  //let quasi2 = (vec2<f32>(PHI_2_1, PHI_2_2) * (vec2<f32>(ij) + f*f + f)) % 1.0;

  let ditherAngle = IGN(ij, f);
  let spinAngle = 0.0;//quasi1;
  let jitterSample = quasi;//(quasi2.x*quasi2.y*1611.171) % 1.0;

  let angle = ((ditherAngle + spinAngle) % 1.0) * 3.141592;

  // Sample direction
  let c = cos(angle);
  let s = sin(angle);
  let da = vec2<f32>(c, s);

  // Slope bias
  let nz = abs(dot(normal, view));
  let bias = 0.0 * select(0.0, 0.05 * (1.0 - nz * nz), ij.y > 200);

  // Clip-space radius (ellipse)
  let clipDR = (to3D(viewToClip(vec4<f32>(position + vec3<f32>(da * radius, 0.0), 1.0))).xy - clip.xy);

  // Project normal/view into view/tangent plane
  let plane = normalize(cross(vec3<f32>(da, 0.0), view));
  let nproj = projectOnPlane(plane, normal);
  let vproj = normalize(projectOnDirection(da, view));

  // Debug logger / point picker
  let pick = getPick();
  let log = (ij.x == pick.x && ij.y == pick.y);
  if (HAS_DEBUG_PICKING && log) {
    printPoint(viewToWorld(vec4<f32>(position, 1.0)), vec4<f32>(1.0, 1.0, 1.0, 1.0));
  }

  // Accumulate cosine(theta) horizon angles
  var cth1 = -1.0;
  var cth2 = -1.0;
  var lcths1 = 0.0;
  var lcths2 = 0.0;
  
  for (var i = 1; i <= SAMPLES; i++) {
    let df = (f32(i) - jitterSample) * inv;
    let df2 = df*df*df;

    let ds = clipDR * df;
    let clip1 = clip.xy + ds;
    let clip2 = clip.xy - ds;

    let uv1 = clipXYToUV(clip1);
    let uv2 = clipXYToUV(clip2);

    let d1 = getDepth(uv1);
    let d2 = getDepth(uv2);

    var s1 = to3D(clipToView(vec4<f32>(clip1, d1, 1.0)));
    var s2 = to3D(clipToView(vec4<f32>(clip2, d2, 1.0)));

    if (HAS_DEBUG_PICKING && log) {
      printLine(viewToWorld(vec4<f32>(position, 1.0)), viewToWorld(vec4<f32>(s1, 1.0)), vec4<f32>(0.3, 0.75, 1.0, 1.0));
      printLine(viewToWorld(vec4<f32>(position, 1.0)), viewToWorld(vec4<f32>(s2, 1.0)), vec4<f32>(0.6, 0.75, 1.0, 1.0));
    }

    let os1 = normalize(projectOnDirection(da, s1 - position));
    let os2 = normalize(projectOnDirection(da, s2 - position));

    let cths1 = dot(os1, vproj);
    let cths2 = dot(os2, vproj);

    //cth1 = max(cth1, cths1);
    //cth2 = max(cth2, cths2);
    
    cth1 = mix(updateCosTheta(cth1, cths1, lcths1), cth1, df2);
    cth2 = mix(updateCosTheta(cth2, cths2, lcths2), cth2, df2);

    lcths1 = cths1;
    lcths2 = cths2;
  }

  // Slope bias
  cth1 = mix(cth1, -1.0, bias);
  cth2 = mix(cth2, -1.0, bias);

  // In-plane normal angle + integral correction
  let gamma = acos1(dot(normalize(nproj), view)) * sign(dot(plane, cross(nproj, view)));
  let lnproj = length(nproj);

  // Get horizon angles
  let acth1 = acos1(cth1);
  let acth2 = -acos1(cth2);
  let th1 = gamma + clamp(acth1 - gamma, -1.570796, 1.570796);
  let th2 = gamma + clamp(acth2 - gamma, -1.570796, 1.570796);

  // Integrate view->horizon arcs
  let cg = cos(gamma);
  let sg = sin(gamma);
  let thv2 = 2.0 * vec2<f32>(th1, th2);
  let slice = (cos(thv2 - gamma) - cg - thv2 * sg);
  let visibility = -0.25 * lnproj * (slice.x + slice.y);

  // Bent normal
  let up = normal;
  let upProj = normalize(nproj);
  let side = vec3<f32>(da, 0.0);
  let halfAngle = (th1 + th2) / 2.0 - gamma;
  let bentNormal = slerpAngle(up, side, halfAngle);
  let worldBentNormal = viewToWorld(vec4<f32>(bentNormal, 0.0)).xyz;

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

    printLine(
      viewToWorld(vec4<f32>(position, 1.0)),
      viewToWorld(vec4<f32>(position + bentNormal, 1.0)),
      vec4<f32>(1.0, 0.0, 0.0, 1.0)
    );

    */
  }

  if (length(vec2<f32>(ij - pick)) < 3.0) {
    return vec4<f32>(0.0, 0.0, 0.0, 1.0);
  }

  // Unorm [0..1] encoding for normal
  let sample = vec4<f32>(worldBentNormal * .5 + .5, visibility);
  return sample;
}
