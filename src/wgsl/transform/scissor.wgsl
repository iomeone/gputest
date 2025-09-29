@link fn getScissorMin() -> vec4<f32> {};
@link fn getScissorMax() -> vec4<f32> {};
@optional @link fn getScissorLoop() -> vec4<f32> { return vec4<f32>(0.0, 0.0, 0.0, 0.0); };

@export fn getScissorLevel(position: vec4<f32>) -> vec4<f32> {

  var smin = getScissorMin();
  var smax = getScissorMax();
  let sloop = getScissorLoop();

  if (HAS_SCISSOR_LOOP) {
    smin = select(smin, smin + sloop, smin < -sloop);
    smin = select(smin, smin - sloop, smin > sloop);
    smax = select(smax, smax + sloop, smax < -sloop);
    smax = select(smax, smax - sloop, smax > sloop);
  }

  var pmin = position - smin;
  var pmax = smax - position;

  if (HAS_SCISSOR_LOOP) {
    pmin = select(pmin, pmin + sloop, pmin < -sloop);
    pmin = select(pmin, pmin - sloop, pmin > sloop);
    pmax = select(pmax, pmax + sloop, pmax < -sloop);
    pmax = select(pmax, pmax - sloop, pmax > sloop);
  }

  return select(pmin, pmax, abs(pmin) > abs(pmax));
};
