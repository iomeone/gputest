import type { LiveComponent, LiveElement } from '../../live';
import type { UniformAttribute } from '../../core';
import type { ShaderSource, ShaderModule } from '../../shader';

import { use, useMemo } from '../../live';
import { bindBundle } from '../../shader/wgsl';
import { useFeedbackContext } from '../providers/feedback-provider';
import { useBoundSource } from '../hooks/useBoundSource';
import { RawFullScreen } from '../primitives';

export type FeedbackProps = {
  shader?: ShaderModule,
};

const FEEDBACK_BINDING = {name: 'getFeedback', format: 'vec4<f32>', args: ['vec2<f32>']} as UniformAttribute;

export const Feedback: LiveComponent<FeedbackProps> = ({shader}: FeedbackProps) => {
  const texture = useFeedbackContext();
  const source = useBoundSource(FEEDBACK_BINDING, texture);

  return useMemo(() => (
    use(RawFullScreen, {
      texture: shader ? bindBundle(shader, {getFeedback: source}) : source,
    })
  ), [shader, texture]);
}
