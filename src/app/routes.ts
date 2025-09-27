import { use } from '@use-gpu/live';

import { GeometryDataPage } from './pages/geometry/data';
import { GeometryLinesPage } from './pages/geometry/lines';
import { DebugAtlasPage } from './pages/debug/atlas';
import { LayoutDisplayPage } from './pages/layout/display';
import { MeshRawPage } from './pages/mesh/raw';
import { LinearRGBPage } from './pages/rtt/linear-rgb';
import { PlotSimplePage } from './pages/plot/simple';

import { HomePage } from './pages/home';
import { EmptyPage } from './pages/empty';

import { InteractPage } from './pages/interact';
import { LayoutPage } from './pages/layout';

export const PAGES = [
  {path: "/geometry/lines", title: "Geometry - 3D Lines and Arrows"},
  {path: "/geometry/data", title: "Geometry - Data-driven Layers"},
  {path: "/layout/display", title: "Layout - Box model"},
  {path: "/mesh/raw", title: "Mesh - Direct Rendering"},
  {path: "/plot/simple", title: "Plot - Simple"},
  {path: "/rtt/linear-rgb", title: "RTT - Linear RGB"},
  {path: "/debug/atlas", title: "Debug - Text Atlas"},
  {path: "/", title: "Index"},
];

export const makeRoutes = () => ({
  "/geometry/data": { element: use(GeometryDataPage) },
  "/geometry/lines": { element: use(GeometryLinesPage) },
  "/layout/display": { element: use(LayoutDisplayPage) },
  "/mesh/raw": { element: use(MeshRawPage) },
  "/plot/simple": { element: use(PlotSimplePage) },
  "/rtt/linear-rgb": { element: use(LinearRGBPage)},
  "/debug/atlas": { element: use(DebugAtlasPage) },

  "/layout": { element: use(LayoutPage) },
  "/interact": { element: use(InteractPage) },

  "/": { element: use(HomePage, { container: document.querySelector('#use-gpu') }) },
  "*": { element: use(EmptyPage) },
});