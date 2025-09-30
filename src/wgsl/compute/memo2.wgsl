use '@use-gpu/wgsl/use/array'::{ packIndex2, sizeToModulus2 };

@link fn getSize() -> vec2<u32> {};

@infer type T;
@link fn getSample(i: u32) -> T;
@link fn setSample(i: u32, @infer(T) v: T);

@compute @workgroup_size(8, 8)
@export fn memoSample(
  @builtin(global_invocation_id) globalId: vec3<u32>,
) {
  let size = getSize();
  let xy = vec2<u32>(globalId.xy);
  if (any(xy >= size)) { return; }

  let m = sizeToModulus2(size);
  let i = packIndex2(xy, m);
  setSample(i, getSample(i));
}
