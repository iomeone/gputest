import type { LC, LiveElement } from '../../live';
import type { StorageSource, UniformType } from '../../core';
import type { ShaderSource } from '../../shader';

import { wgsl } from '../../shader/wgsl';
import { use, yeet, useMemo } from '../../live';
import { Dispatch } from '../queue/dispatch';

import { getShader, useShader } from '../hooks/useShader';
import { useScratchSource } from '../hooks/useScratchSource';

import { memoSample } from '../../wgsl/compute/memo2wgsl';

export type Memo2Props = {
  shader: ShaderSource,
  format: UniformType,
  size?: [number, number],
  render?: (source: StorageSource) => LiveElement,
};

export const Memo2: LC<Memo2Props> = (props: Memo2Props) => {

  const {
    shader,
    size,
    format,
    render,
  } = props;

  const [w, h] = size ?? [0, 0];
  const reserve = (shader as any)?.length ?? ((w * h) || 16);
  const [buffer] = useScratchSource(format, {readWrite: true, reserve});

  const setter = useMemo(() =>
    getShader(wgsl`
      @link var<storage, read_write> memoBuffer: array<${format}>;
      @export fn main(i: u32, v: ${format}) -> {
        memoBuffer[i] = v;
      };
    `, [buffer]),
    [format, buffer]
  );

  const bound = useShader(memoSample, [
    () => size ?? (shader as any)?.size ?? [0, 0],
    buffer,
    setter,
  ]);

  return [
    use(Dispatch, {
      shader: bound,
      size: () => size ?? (shader as any)?.size ?? [0, 0],
      group: [8, 8],
    }),
    render ? render(buffer) : yeet(buffer),
  ];
};
