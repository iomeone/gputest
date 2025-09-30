import { RawFaces } from '../primitives/raw-faces';
import type { RawFacesProps, RawFacesFlags } from '../primitives/raw-faces';

export type FaceLayerFlags = RawFacesFlags;
export type FaceLayerProps = RawFacesProps;

/** Draws direct or indexed triangles, or segmented (convex) faces. */
export const FaceLayer = RawFaces;