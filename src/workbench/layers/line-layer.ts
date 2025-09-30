import { RawLines } from '../primitives/raw-lines';
import type { RawLinesProps, RawLinesFlags } from '../primitives/raw-lines';

export type LineLayerFlags = RawLinesFlags;
export type LineLayerProps = RawLinesProps;

/** Draws line segments. */
export const LineLayer = RawLines;