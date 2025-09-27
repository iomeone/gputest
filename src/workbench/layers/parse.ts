import { makeParseEnum } from '@use-gpu/traits';
import { PointShape } from './types';

export const parsePointShape = makeParseEnum<PointShape>([
  'circle',
  'diamond',
  'square',
  'circleOutlined',
  'diamondOutlined',
  'squareOutlined',
]);
