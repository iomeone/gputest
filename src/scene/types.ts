import type { VectorLike } from '../traits';
import type { ShaderSource } from '../shader';

export type ObjectTrait = {
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
