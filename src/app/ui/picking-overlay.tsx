import type { LC } from '@use-gpu/live';
import React from '@use-gpu/live';

import {
  Flat,
  PickingContext,
  useBoundShader, useLambdaSource,
} from '@use-gpu/workbench';
import {
  UI, Layout, Absolute, Block, Inline, Text,
} from '@use-gpu/layout';
import { useContext } from '@use-gpu/live';
import { wgsl, bindModule, bundleToAttributes } from '@use-gpu/shader/wgsl';

export const PickingOverlay: LC = () => {

  const pickingContext = useContext(PickingContext);
  if (!pickingContext) return null;

  // Display picking buffer with colorization shader
  const {pickingSource} = pickingContext;
  const colorizeShader = wgsl`
    // Picking buffer is int32, have to use direct texture load.
    @link fn getSize() -> vec2<f32>;
    @link fn getPicking(uv: vec2<i32>, level: i32) -> vec4<u32>;

    fn main(uv: vec2<f32>) -> vec4<f32> {
      let iuv = vec2<i32>(uv * getSize());
      let pick = vec2<f32>(getPicking(iuv, 0).xy);

      // Pick value is (r, g) = (id, index) tuple
      let a = (pick.r / 16.0) % 1.0;
      let b = (pick.g / 16.0) % 1.0;
      let c = (pick.r + pick.g) / 256.0;
      return sqrt(vec4<f32>(a, c, b, 1.0));
    }
  `;
  const BINDINGS = bundleToAttributes(colorizeShader);
  const boundShader = useBoundShader(colorizeShader, BINDINGS, [() => pickingSource.size, pickingSource]);
  const textureSource = useLambdaSource(boundShader, pickingSource);

  const scale = 0.5;

  return (
    <Flat>
      <UI>
        <Layout>
          <Absolute
            right={0}
          >
            <Block fill={[0, 0, 0, .5]} contain>
              <Block
                width={textureSource.size[0] * scale / window.devicePixelRatio}
                height={textureSource.size[1] * scale / window.devicePixelRatio}
                image={{texture: textureSource}}
                fill={[0, 0, 0, 1]}
              />
              <Inline align="center" margin={[0, 5]}><Text color={[1, 1, 1, 1]} size={24}>GPU Picking Buffer</Text></Inline>
            </Block>
          </Absolute>
        </Layout>
      </UI>
    </Flat>
  );
}