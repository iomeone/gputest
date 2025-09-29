import React from '@use-gpu/live';

import { GeometryDataPage } from './pages/geometry/data';
import { GeometryFacesPage } from './pages/geometry/faces';
import { GeometryGLTFPage } from './pages/geometry/gltf';
import { GeometryLinesPage } from './pages/geometry/lines';
import { GeometryBinaryPage } from './pages/geometry/binary';
import { GeometryVoxelPage } from './pages/geometry/voxel';
import { DebugAtlasPage } from './pages/debug/atlas';
import { DebugAxesPage } from './pages/debug/axes';
import { LayoutDisplayPage } from './pages/layout/display';
import { LayoutGlyphPage } from './pages/layout/glyph';
import { LayoutAlignPage } from './pages/layout/align';
import { MapWebMercatorPage } from './pages/map/webmercator';
import { MeshRawPage } from './pages/mesh/raw';
import { MeshInterleavedPage } from './pages/mesh/interleaved';
import { SceneBasicPage } from './pages/scene/basic';
import { SceneInstancesPage } from './pages/scene/instances';
import { SceneShadowPage } from './pages/scene/shadow';
import { SceneDeferredPage } from './pages/scene/deferred';
import { PlotCartesianPage } from './pages/plot/cartesian';
import { PlotImplicitSurfacePage } from './pages/plot/implicit-surface';
import { PlotPolarPage } from './pages/plot/polar';
import { PlotSphericalPage } from './pages/plot/spherical';
import { PlotStereographicPage } from './pages/plot/stereographic';
import { PresentSlidesPage } from './pages/present/slides';
import { RTTLinearRGBPage } from './pages/rtt/linear-rgb';
import { RTTFeedbackPage } from './pages/rtt/feedback';
import { RTTMultiscalePage } from './pages/rtt/multiscale';
import { RTTCFDComputePage } from './pages/rtt/cfd-compute';
import { RTTCFDTexturePage } from './pages/rtt/cfd-texture';

import { HomePage } from './pages/home';
import { EmptyPage } from './pages/empty';

export const makePages = () => [
  {path: "/geometry/lines",        title: "Geometry - 3D Lines and Arrows",    element: <GeometryLinesPage />},
  {path: "/geometry/faces",        title: "Geometry - 3D Polygons",            element: <GeometryFacesPage />},
  {path: "/geometry/data",         title: "Geometry - Data-driven Layers",     element: <GeometryDataPage />},
  {path: "/geometry/gltf",         title: "Geometry - GLTF",                   element: <GeometryGLTFPage />},
  {path: "/geometry/voxel",        title: "Geometry - Voxels",                 element: <GeometryVoxelPage />},
  {path: "/geometry/binary",       title: "Geometry - Byte Histogram",         element: <GeometryBinaryPage />},
  {path: "/layout/display",        title: "Layout - Box model",                element: <LayoutDisplayPage />},
  {path: "/layout/glyph",          title: "Layout - Glyph Subpixel SDF",       element: <LayoutGlyphPage />},
  {path: "/layout/align",          title: "Layout - Alignment Tests",          element: <LayoutAlignPage />},
  {path: "/map/webmercator",       title: "Map - WebMercator",                 element: <MapWebMercatorPage />},
  {path: "/scene/basic",           title: "Scene - Basic",                     element: <SceneBasicPage />},
  {path: "/scene/instances",       title: "Scene - Instances",                 element: <SceneInstancesPage />},
  {path: "/scene/shadow",          title: "Scene - Shadow",                    element: <SceneShadowPage />},
  {path: "/scene/deferred",        title: "Scene - Deferred Renderer",         element: <SceneDeferredPage />},
  {path: "/plot/cartesian",        title: "Plot - XYZ",                        element: <PlotCartesianPage />},
  {path: "/plot/polar",            title: "Plot - Polar",                      element: <PlotPolarPage />},
  {path: "/plot/spherical",        title: "Plot - Spherical",                  element: <PlotSphericalPage />},
  {path: "/plot/stereographic",    title: "Plot - Stereographic",              element: <PlotStereographicPage />},
  {path: "/plot/implicit-surface", title: "Plot - Implicit Surface",           element: <PlotImplicitSurfacePage />},
  {path: "/present/slides",        title: "Present - Slides",                  element: <PresentSlidesPage />},
  {path: "/rtt/linear-rgb",        title: "RTT - Linear RGB",                  element: <RTTLinearRGBPage />},
  {path: "/rtt/feedback",          title: "RTT - Feedback",                    element: <RTTFeedbackPage />},
  {path: "/rtt/multiscale",        title: "RTT - Multiscale R-D",              element: <RTTMultiscalePage />},
  {path: "/rtt/cfd-compute",       title: "RTT - Fluid Dynamics (Compute I)",  element: <RTTCFDComputePage />},  
  {path: "/rtt/cfd-texture",       title: "RTT - Fluid Dynamics (Compute II)", element: <RTTCFDTexturePage />},   
  {path: "/mesh/raw",              title: "Raw Mesh - DIY Rendering",          element: <MeshRawPage />},
  {path: "/mesh/interleaved",      title: "Raw Mesh - Native Components",      element: <MeshInterleavedPage />},
  {path: "/debug/atlas",           title: "Debug - Text Atlas",                element: <DebugAtlasPage />},
  {path: "/debug/axes",            title: "Debug - Axes",                      element: <DebugAxesPage />},

  {path: "/", title: "Index", element: <HomePage container={document.querySelector('#use-gpu')} />},
];

export const makeRoutes = () => ({
  ...makePages().reduce((out, {path, element}) => (out[path] = {element}, out), {} as Record<string, any>),
  "*": { element: <EmptyPage /> },
});
