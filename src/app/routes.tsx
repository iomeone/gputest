import React from '@use-gpu/live';

import { GeometryGLTFPage } from './pages/geometry/gltf';
import { GeometryLinesPage } from './pages/geometry/lines';
import { GeometryBinaryPage } from './pages/geometry/binary';
import { GeometryVoxelPage } from './pages/geometry/voxel';
import { DebugAtlasPage } from './pages/debug/atlas';
import { DebugAxesPage } from './pages/debug/axes';
import { DebugWireframePage } from './pages/debug/wireframe';
import { LayoutDisplayPage } from './pages/layout/display';
import { LayoutGlyphPage } from './pages/layout/glyph';
import { LayoutAlignPage } from './pages/layout/align';
import { MaterialEnvMapPage } from './pages/material/envmap';
import { MapWebMercatorPage } from './pages/map/webmercator';
import { MeshRawPage } from './pages/mesh/raw';
import { MeshInterleavedPage } from './pages/mesh/interleaved';
import { SceneBasicPage } from './pages/scene/basic';
import { SceneInstancesPage } from './pages/scene/instances';
import { SceneShadowPage } from './pages/scene/shadow';
import { SceneDeferredPage } from './pages/scene/deferred';
import { Plot2DPage } from './pages/plot/2d';
import { Plot3DPage } from './pages/plot/3d';
import { PlotPickingPage } from './pages/plot/picking';
import { PlotCartesianPage } from './pages/plot/cartesian';
import { PlotPolarPage } from './pages/plot/polar';
import { PlotSphericalPage } from './pages/plot/spherical';
import { PlotStereographicPage } from './pages/plot/stereographic';
import { PlotImplicitSurfacePage } from './pages/plot/implicit-surface';
import { PlotQuaternionHyperspherePage } from './pages/plot/quaternion-hypersphere';
import { ShaderDrostePage } from './pages/shader/droste';
import { PresentSlidesPage } from './pages/present/slides';
import { RTTLinearRGBPage } from './pages/rtt/linear-rgb';
import { RTTFeedbackPage } from './pages/rtt/feedback';
import { RTTMultiscalePage } from './pages/rtt/multiscale';
import { RTTCFDComputePage } from './pages/rtt/cfd-compute';
import { RTTCFDTexturePage } from './pages/rtt/cfd-texture';
import { FPSControlsPage } from './pages/controls/fps';

import { HomePage } from './pages/home';
import { EmptyPage } from './pages/empty';

export const makePages = () => [
  {path: "/plot/2d",                     title: "Plot - 2D",                         element: <Plot2DPage />},
  {path: "/plot/3d",                     title: "Plot - 3D",                         element: <Plot3DPage />},
  {path: "/plot/picking",                title: "Plot - GPU Picking",                element: <PlotPickingPage />},
  {path: "/geometry/lines",              title: "Geometry - 3D Lines and Arrows",    element: <GeometryLinesPage />},
  {path: "/geometry/gltf",               title: "Geometry - GLTF",                   element: <GeometryGLTFPage />},
  {path: "/geometry/voxel",              title: "Geometry - Voxels",                 element: <GeometryVoxelPage />},
  {path: "/geometry/binary",             title: "Geometry - Byte Histogram",         element: <GeometryBinaryPage />},
  {path: "/material/envmap",             title: "Material - Environment Map",        element: <MaterialEnvMapPage />},
  {path: "/layout/display",              title: "Layout - Box model",                element: <LayoutDisplayPage />},
  {path: "/layout/glyph",                title: "Layout - Glyph Subpixel SDF",       element: <LayoutGlyphPage />},
  {path: "/layout/align",                title: "Layout - Alignment Tests",          element: <LayoutAlignPage />},
  {path: "/map/webmercator",             title: "Map - WebMercator",                 element: <MapWebMercatorPage />},
  {path: "/scene/basic",                 title: "Scene - Basic",                     element: <SceneBasicPage />},
  {path: "/scene/instances",             title: "Scene - Instances",                 element: <SceneInstancesPage />},
  {path: "/scene/shadow",                title: "Scene - Shadow",                    element: <SceneShadowPage />},
  {path: "/scene/deferred",              title: "Scene - Deferred Renderer",         element: <SceneDeferredPage />},
  {path: "/plot/cartesian",              title: "Plot - XYZ",                        element: <PlotCartesianPage />},
  {path: "/plot/polar",                  title: "Plot - Polar",                      element: <PlotPolarPage />},
  {path: "/plot/spherical",              title: "Plot - Spherical",                  element: <PlotSphericalPage />},
  {path: "/plot/stereographic",          title: "Plot - Stereographic",              element: <PlotStereographicPage />},
  {path: "/plot/implicit-surface",       title: "Plot - Implicit Surface",           element: <PlotImplicitSurfacePage />},
  {path: "/plot/quaternion-hypersphere", title: "Plot - Quaternion Hypersphere",    element: <PlotQuaternionHyperspherePage />},
  {path: "/shader/droste",               title: "Shader - Droste grids",             element: <ShaderDrostePage />},
  {path: "/rtt/linear-rgb",              title: "RTT - Linear RGB",                  element: <RTTLinearRGBPage />},
  {path: "/rtt/feedback",                title: "RTT - Feedback",                    element: <RTTFeedbackPage />},
  {path: "/rtt/multiscale",              title: "RTT - Multiscale R-D",              element: <RTTMultiscalePage />},
  {path: "/rtt/cfd-compute",             title: "RTT - Fluid Dynamics (Compute I)",  element: <RTTCFDComputePage />},
  {path: "/rtt/cfd-texture",             title: "RTT - Fluid Dynamics (Compute II)", element: <RTTCFDTexturePage />},
  {path: "/present/slides",              title: "Present - Slides",                  element: <PresentSlidesPage />},
  {path: "/mesh/raw",                    title: "Raw Mesh - DIY Rendering",          element: <MeshRawPage />},
  {path: "/mesh/interleaved",            title: "Raw Mesh - Native Components",      element: <MeshInterleavedPage />},
  {path: "/controls/fps",                title: "Controls - FPS",                    element: <FPSControlsPage />},
  {path: "/debug/atlas",                 title: "Debug - Text Atlas",                element: <DebugAtlasPage />},
  {path: "/debug/axes",                  title: "Debug - Axes",                      element: <DebugAxesPage />},
  {path: "/debug/wireframe",             title: "Debug - Wireframe",                 element: <DebugWireframePage />},

  {path: "/", title: "Index", element: <HomePage container={document.querySelector('#use-gpu')} />},
];

export const makeRoutes = () => ({
  ...makePages().reduce((out, {path, element}) => (out[path] = {element}, out), {} as Record<string, any>),
  "*": { element: <EmptyPage /> },
});
