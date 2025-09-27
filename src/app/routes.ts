import { use } from '@use-gpu/live';

import { GeometryDataPage } from './pages/geometry/data';
import { GeometryLinesPage } from './pages/geometry/lines';
import { AtlasPage } from './pages/debug/atlas';
import { RawMeshPage } from './pages/mesh/raw';
import { LinearRGBPage } from './pages/rtt/linear-rgb';
import { SimplePlotPage } from './pages/plot/simple';

import { HomePage } from './pages/home';
import { EmptyPage } from './pages/empty';

import { InteractPage } from './pages/interact';
import { LayoutPage } from './pages/layout';

export const PAGES = [
  {path: "/geometry/lines", title: "Geometry - 3D Lines and Arrows"},
  {path: "/geometry/data", title: "Geometry - Data-driven Layers"},
  {path: "/mesh/raw", title: "Mesh - Direct Rendering"},
  {path: "/plot/simple", title: "Plot - Simple"},
  {path: "/rtt/linear-rgb", title: "RTT - Linear RGB"},
  {path: "/debug/atlas", title: "Debug - Text Atlas"},
  {path: "/", title: "Index"},
];

export const makeRoutes = (canvas: HTMLCanvasElement) => ({
  "/geometry/data": { element: use(GeometryDataPage, { canvas }) },
  "/geometry/lines": { element: use(GeometryLinesPage, { canvas }) },
  "/mesh/raw": { element: use(RawMeshPage, { canvas }) },
  "/plot/simple": { element: use(SimplePlotPage, { canvas }) },
  "/rtt/linear-rgb": { element: use(LinearRGBPage, { canvas })},
  "/debug/atlas": { element: use(AtlasPage, { canvas }) },

  "/layout": { element: use(LayoutPage, { }) },
  "/interact": { element: use(InteractPage, { }) },

  "/": { element: use(HomePage, { container: canvas.parentElement }) },
  "*": { element: use(EmptyPage, { }) },
});