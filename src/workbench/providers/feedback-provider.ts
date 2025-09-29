import type { LiveComponent, LiveElement } from '../../live';
import type { TextureSource } from '../../core';

import { makeContext, useContext, useNoContext } from '../../live';

export const FeedbackContext = makeContext<TextureSource>(undefined, 'FeedbackContext');

export const useFeedbackContext = () => useContext<TextureSource>(FeedbackContext);
export const useNoFeedbackContext = () => useNoContext(FeedbackContext);
