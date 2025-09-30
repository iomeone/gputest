import type { VectorLike } from '@use-gpu/core';
import type { ShaderSource } from '@use-gpu/shader';

export type NodeTransform = {
  position: VectorLike,
  scale: VectorLike,
  quaternion: VectorLike,
  rotation: VectorLike,
  matrix: VectorLike,
};

export type InstanceAggregate = {
  instance: number,
  mesh: Record<string, ShaderSource>,
  material: Record<string, Record<string, ShaderSource>>,
};
