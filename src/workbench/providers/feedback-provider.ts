import type { TextureSource } from '@use-gpu/core';

import { makeContext, useContext, useNoContext } from '@use-gpu/live';

export const FeedbackContext = makeContext<TextureSource>(undefined, 'FeedbackContext');

export const useFeedbackContext = () => useContext<TextureSource>(FeedbackContext);
export const useNoFeedbackContext = () => useNoContext(FeedbackContext);
