import type { LiveComponent, LiveElement } from '../../live';
import type { TextureSource } from '../../core';
import { provide, makeContext, useContext } from '../../live';

export const FeedbackContext = makeContext<TextureSource>(undefined, 'FeedbackContext');

export const useFeedbackContext = () => useContext<TextureSource>(FeedbackContext);
