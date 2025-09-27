import { RawFaces, RawFacesProps } from '../primitives/raw-faces';

export type FaceLayerProps = RawFacesProps;

/** Draws direct or indexed triangles, or segmented (convex) faces. */
export const FaceLayer = RawFaces;