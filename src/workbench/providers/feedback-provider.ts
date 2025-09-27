import type { LiveComponent, LiveElement } from '@use-gpu/live';
import type { TextureSource } from '@use-gpu/core';
import { provide, makeContext, useContext } from '@use-gpu/live';

export const FeedbackContext = makeContext<TextureSource>(undefined, 'FeedbackContext');

export const useFeedbackContext = () => useContext<TextureSource>(FeedbackContext);
