import type { LC, RefObject, PropsWithChildren } from '@use-gpu/live';

import React, { useRef } from '@use-gpu/live';
import { wgsl } from '@use-gpu/shader/wgsl';

import { PanControls, Pass, LinearRGB, FullScreen, QueueReconciler } from '@use-gpu/workbench';

import { InfoBox } from '../../ui/info-box';
import { DrosteControls } from '../../ui/droste-controls';

const textureShader = wgsl`
@link fn getTextureSize() -> vec2<f32>;
@link fn getXYZoom() -> vec3<f32>;

@optional @link fn getFunctionType() -> i32 { return 0; };
@optional @link fn getGridType() -> i32 { return 0; };
@optional @link fn getTurn() -> i32 { return 0; };
@optional @link fn getInvert() -> i32 { return 0; };
@optional @link fn getSeparation() -> f32 { return 0.0; };
@optional @link fn getSymmetry() -> i32 { return 0; };
@optional @link fn getShift() -> vec2<f32> { return vec2<f32>(0.0); };

const LN_2 = 0.6931471806;
const PI = 3.1415926536;
const UNIT_CD = vec4<f32>(1.0, 0.0, 0.0, 0.0);

fn main(uv: vec2<f32>) -> vec4<f32> {
  let sz = getTextureSize();
  let xyz = getXYZoom();

  let funcType = getFunctionType();
  let gridType = getGridType();
  let turn = getTurn();
  let invert = getInvert();
  let separation = getSeparation();
  let symmetry = getSymmetry();
  let shift = getShift();

  let xy = ((uv * sz / xyz.z - xyz.xy) * 2.0 - sz) / sz.y;
  let dd = duv(xy);
  
  let xyd = to_cd(xy);
  var pos = xyd;

  if (funcType == 0) {
    pos = escher_mod_cd(xyd, turn);    
  }
  else if (funcType == 1) {
    let xy0 = xyd;
    let xy1 = mul_cd(xy0, xy0) + vec4<f32>(shift, 0.0, 0.0);
    pos = escher_mod_cd(xy1, turn);
  }
  else if (funcType == 2) {
    let xy0 = xyd;
    let xy1 = mul_cd(xy0, xy0) + vec4<f32>(shift, 0.0, 0.0);
    pos = div_cd(escher_mod_cd(xy0, turn), xy1);
  }
  else if (funcType == 3) {
    pos = rcp_cd(xyd);
    
    for (var i = 0; i < symmetry; i++) {
      let th = f32(i) / f32(symmetry) * 2.0 * PI;
      let c = cos(th);
      let s = sin(th);
      
      pos = mul_cd(pos, xyd + vec4<f32>(s, c, 0.0, 0.0) * (1.0 + separation));
      pos = div_cd(pos, xyd + vec4<f32>(s, c, 0.0, 0.0) * (1.0 - separation));
    }
    pos = escher_mod_cd(pos, turn);
  }
  
  if (invert > 0) {
    pos = rcp_cd(pos);
  }
  
  var rgba = vec4<f32>(0.0);
  if (gridType == 0) {
    rgba = logGrid_cd(pos, dd);
  }
  else if (gridType == 1) {
    rgba = zoomGrid_cd(pos, dd);
  }
  else if (gridType == 2) {
    rgba = logPolarGrid_cd(pos, dd);
  }
  else if (gridType == 3) {
    rgba = logPolarZoomGrid_cd(pos, dd);
  }

  return rgba;
}

fn escher_mod_cd(xy: vec4<f32>, turn: i32) -> vec4<f32> {
  let shift = LN_2/PI/2.0;

  let xy2 = log_cd(xy);
  let xy3 = rottan_mod_cd(xy2, shift, turn);
  let xy4 = exp_cd(xy3);
  
  return xy4;
}

fn escher_cd(xy: vec4<f32>, turn: i32) -> vec4<f32> {
  let shift = LN_2/PI/2.0;

  let xy2 = log_cd(xy);
  let xy3 = rottan_cd(xy2, shift, turn);
  let xy4 = exp_cd(xy3);
  
  return xy4;
}

/////////////////////////////////////////////////////////
// Grids

fn logGrid_cd(uv: vec4<f32>, ds: f32) -> vec4<f32> {
  let dd = ds * length(uv.zw);
  
  let auv = abs(uv.xy);
  let diag = max(auv.x, auv.y);
  let ld = 3.0 - log(diag) / log(2.0);

  let s1 = pow(2.0, floor(ld));
  let s2 = s1 / 4.0;

  let v1 = grid(uv.xy, dd, s1, 4.0, 1.0);
  let v2 = grid(uv.xy, dd, s2, 6.0, 1.0);
  let grey = max(v1 * .35, v2);
  
  return vec4<f32>(grey, grey, grey, 1.0);
}

fn zoomGrid_cd(uv: vec4<f32>, ds: f32) -> vec4<f32> {
  let dd = ds * length(uv.zw);
  let ld = -2.5 - log(dd) / log(4.0);
  let fld = floor(ld);
  let dld = ld - fld;

  let s1 = pow(4.0, fld);
  let s2 = s1 / 4.0;

  let v1 = grid(uv.xy, dd, s1, 4.0, 1.0);
  let v2 = grid(uv.xy, dd, s2, 6.0, 1.0);
  let grey1 = max(v1 * .35, v2);

  let v3 = grid(uv.xy, dd, s1 * 4.0, 4.0, 1.0);
  let v4 = grid(uv.xy, dd, s2 * 4.0, 6.0, 1.0);
  let grey2 = max(v3 * .35, v4);

  let grey = mix(grey1, grey2, dld);
  
  return vec4<f32>(grey, grey, grey, 1.0);
}

fn logPolarGrid_cd(uv: vec4<f32>, ds: f32) -> vec4<f32> {
  let dd = ds * length(uv.zw);

  let diag = length(uv.xy);
  let ldiag = log(diag) / log(2.0);
  let ld = 3.0 - ldiag;

  let th = atan2(uv.y, uv.x);
  let xy = vec2<f32>(ldiag, th / PI * 4.0);

  let ddd = 2.0 * dd / diag;
  let v1 = grid(xy, ddd, 4.0, 4.0, PI / 4.0);
  let v2 = grid(xy, ddd, 1.0, 6.0, PI / 4.0);

  let grey = max(v1 * .35, v2);
  return vec4<f32>(grey, grey, grey, 1.0);
}

fn logPolarZoomGrid_cd(uv: vec4<f32>, ds: f32) -> vec4<f32> {
  let dd = ds * length(uv.zw);
  let diag = length(uv.xy);
  let ddd = PI/2.0 * dd / diag;

  let sld = -1.8 - log(ddd) / log(16.0 / PI);
  let fld = floor(sld);
  let dld = sld - fld;

  let s1 = pow(4.0, fld);
  let s2 = s1 / 4.0;

  let ldiag = log(diag) / log(2.0);

  let th = atan2(uv.y, uv.x);
  let xy = vec2<f32>(ldiag, th / PI * 4.0);

  let v1 = grid(xy, ddd, s1, 4.0, PI / 4.0);
  let v2 = grid(xy, ddd, s2, 6.0, PI / 4.0);
  let grey1 = max(v1 * .35, v2);

  let v3 = grid(xy, ddd, s1 * 4.0, 4.0, PI / 4.0);
  let v4 = grid(xy, ddd, s2 * 4.0, 6.0, PI / 4.0);
  let grey2 = max(v3 * .35, v4);

  let grey = mix(grey1, grey2, dld);
  return vec4<f32>(grey, grey, grey, 1.0);
}

fn grid(uv: vec2<f32>, dd: f32, g: f32, w: f32, af: f32) -> f32 {
  let xy = (uv * g) + .5;
  let xym = (xy - floor(xy)) - .5;
  let xya = abs(xym);

  //let threshold = w * dd * g;
  //let df = min(xya.x, xya.y) * 2.0;
  //let level = .5 - (df - threshold) / dd / g / 2.0;

  let threshold = w * vec2<f32>(dd, dd * af) * g;
  let df = min(xya.x, xya.y) * 2.0;
  let dm = 2.0 * xya - threshold;
  let level = .5 - min(dm.x, dm.y) / dd / g / 2.0;

  return clamp(level, 0.0, 1.0);
}

fn duv(uv: vec2<f32>) -> f32 {
  let du = dpdx(uv);
  let dv = dpdy(uv);
  return (length(du) + length(dv)) / 2.0;
}

/////////////////////////////////////////////////////////
// Dual complex arithmetic

fn to_cd(xy: vec2<f32>) -> vec4<f32> { return vec4<f32>(xy, 1.0, 0.0); }

fn mul_cd(a: vec4<f32>, b: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(
    mul_c(a.xy, b.xy),
    mul_c(a.xy, b.zw) + mul_c(a.zw, b.xy),
  );
}

fn div_cd(a: vec4<f32>, b: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(
    div_c(a.xy, b.xy),
    div_c((mul_c(a.zw, b.xy) - mul_c(a.xy, b.zw)), mul_c(b.xy, b.xy)),
  );
}

fn rcp_cd(v: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(
    rcp_c(v.xy),
    div_c(-v.zw, mul_c(v.xy, v.xy)),
  );
}

fn exp_cd(v: vec4<f32>) -> vec4<f32> {
  let ev = exp_c(v.xy);
  return vec4<f32>(
    ev,
    mul_c(v.zw, ev),
  );
}

fn log_cd(v: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(
    log_c(v.xy),
    div_c(v.zw, v.xy),
  );
}

fn rottan_cd(v: vec4<f32>, shift: f32, turn: i32) -> vec4<f32> {
  let t = shift * f32(turn);
  return vec4<f32>(
    rottan_c(v.xy, shift, turn),
    mul_c(v.zw, vec2<f32>(1, t)),
  );
}

fn rottan_mod_cd(v: vec4<f32>, shift: f32, turn: i32) -> vec4<f32> {
  var xy = rottan_cd(v, shift, turn);
  if (xy.y > PI) {
    xy.y -= 2.0 * PI;
    xy.x += LN_2 * f32(turn);
  }
  else if (xy.y < -PI) {
    xy.y += 2.0 * PI;
    xy.x -= LN_2 * f32(turn);
  }
  return xy;
}

/////////////////////////////////////////////////////////
// Complex arithmetic

fn mul_c(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
  return vec2<f32>(
    a.x * b.x - a.y * b.y,
    a.x * b.y + a.y * b.x,
  );
}

fn div_c(a: vec2<f32>, b: vec2<f32>) -> vec2<f32> {
  return mul_c(a, rcp_c(b));
}

fn rcp_c(v: vec2<f32>) -> vec2<f32> {
  let r2 = dot(v, v);
  return vec2<f32>(v.x, -v.y) / r2;
}

fn exp_c(v: vec2<f32>) -> vec2<f32> {
  let r = exp(v.x);
  let c = cos(v.y);
  let s = sin(v.y);
  return vec2<f32>(
    c * r,
    s * r,
  );
}

fn log_c(v: vec2<f32>) -> vec2<f32> {
  let r = log(length(v));
  let th = atan2(v.y, v.x);
  return vec2<f32>(
    r,
    th,
  );
}

fn rottan_c(v: vec2<f32>, shift: f32, turn: i32) -> vec2<f32> {
  let t = shift * f32(turn);
  let x = v.x - v.y * t;
  let y = v.x * t + v.y;
  return vec2<f32>(x, y);
}

`;

export const ShaderDrostePage: LC = () => {

  const inner = document.querySelector('#use-gpu .canvas')!;
  const viewRef = useRef<[number, number, number]>([0, 0, 1]);

  return (<>
    <InfoBox>Render Escher-like conformal grids using a custom, fully zoomable &lt;FullScreen&gt; shader</InfoBox>
    <LinearRGB tonemap="aces">
      <DrosteControls container={inner}>{
        ({func, grid, turn, invert, separation, symmetry, shiftX, shiftY}) =>
          <PanShaderView ref={viewRef} key={`f${func}`}>
            <Pass>
                <FullScreen
                  shader={textureShader}
                  args={[viewRef, func, grid, turn, invert, separation, symmetry, [shiftX, shiftY]]}
                />
            </Pass>
          </PanShaderView>
      }</DrosteControls>
    </LinearRGB>
  </>);
};

type PanShaderViewProps = PropsWithChildren<{
  ref: RefObject<[number, number, number]>,
}>;

const PanShaderView = ({ref, children}: PanShaderViewProps) => (
  <PanControls centered>{
    (x, y, zoom) => {
      const {current: view} = ref;
      
      // Pass view parameters directly to shader
      if (view) {
        view[0] = x * window.devicePixelRatio;
        view[1] = y * window.devicePixelRatio;
        view[2] = zoom;
      }

      const {signal} = QueueReconciler;
      return [
        signal(),
        children,
      ];
    }
  }</PanControls>
);
