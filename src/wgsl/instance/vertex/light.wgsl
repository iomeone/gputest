use '@use-gpu/wgsl/use/view'::{ worldToClip };
use '@use-gpu/wgsl/use/types'::{ LightVertex, Light };
use '@use-gpu/wgsl/geometry/quad'::{ getQuadUV };

@link fn getLight(i: u32) -> Light;

@optional @link fn getInstance(index: u32) -> u32 { return index; };
@optional @link fn getPosition(i: u32) -> vec4<f32> { return vec4<f32>(0.0); };
@optional @link fn getIndex(index: u32) -> u32 { return index; };
@optional @link fn getScale() -> f32 { return 1.0; };

@export fn getLightVertex(vertexIndex: u32, instanceIndex: u32) -> LightVertex {
  let instance = getInstance(instanceIndex);

  if (IS_FULLSCREEN) {
    let uv = getQuadUV(vertexIndex);
    let xy = uv * 2.0 - 1.0;
    let vertex = vec4<f32>(xy * 2.0 + 1.0, 0.5, 1.0);

    return LightVertex(vertex, instance);
  } else {
    let light = getLight(instance);

    var world: vec4<f32>;
    if (light.kind == 3) {
      let sphere = getPosition(getIndex(vertexIndex));
      let scale = sqrt(light.intensity * 3.1415 / light.cutoff) * getScale();
      world = vec4<f32>(light.position.xyz + sphere.xyz * scale, 1.0);
    }

    let position = worldToClip(world);
    return LightVertex(position, instance);
  }
}
