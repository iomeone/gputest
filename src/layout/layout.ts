import type { LiveComponent, LiveElement, PropsWithChildren } from '@use-gpu/live';
import type { Point, Point4, Rectangle } from '@use-gpu/core';
import type { Placement } from '@use-gpu/traits';
import type { FitInto, LayoutElement, LayoutPicker } from './types';

import { parsePlacement, useProp } from '@use-gpu/traits';
import { memo, signal, provide, gather, use, keyed, fragment, useContext, useCapture, useFiber, useMemo, useOne, incrementVersion } from '@use-gpu/live';

import {
  DebugContext, MouseContext, WheelContext, ViewContext,
  LayoutContext, useTransformContext,
  useInspectable, useInspectHoverable, useInspectorSelect, Inspector,
  useBoundShader, useNoBoundShader,
} from '@use-gpu/workbench';

import { chainTo } from '@use-gpu/shader/wgsl';
import { getLayoutPosition } from '@use-gpu/wgsl/layout/layout.wgsl';

import { makeBoxInspectLayout } from './lib/util';
import { UIRectangle } from './shape/ui-rectangle';
import { mat4, vec2, vec3 } from 'gl-matrix';

export type LayoutProps = {
  width?: number,
  height?: number,
  placement?: Placement,
  inspect?: boolean,
  render?: () => LiveElement,
};

const DEFAULT_PLACEMENT = vec2.fromValues(1, 1);

export const Layout: LiveComponent<LayoutProps> = memo((props: PropsWithChildren<LayoutProps>) => {
  const {width, height, render, children} = props;
  const placement = useProp(props.placement, parsePlacement, DEFAULT_PLACEMENT);

  const inspect = useInspectable();
  const hovered = useInspectHoverable();

  // Remove X/Y flip from layout
  const layout = useContext(LayoutContext);
  const [l, t, r, b] = layout;
  let left = Math.min(l, r);
  let top = Math.min(t, b);
  let right = Math.max(l, r);
  let bottom = Math.max(t, b);
  if (width != null) right = left + width;
  if (height != null) bottom = top + height;

  const view = (
    provide(LayoutContext, [left, top, right, bottom], children ?? (render ? render() : null))
  );

  return gather(view, Resume(placement, inspect, hovered));
}, 'Layout');

const Resume = (placement: vec2, inspect: Inspector, hovered: boolean) => (els: LayoutElement[]) => {
  const layout = useContext(LayoutContext);
  const {layout: {inspect: toggleInspect}} = useContext(DebugContext);

  const [l, t, r, b] = layout;
  const left = Math.min(l, r);
  const top = Math.min(t, b);
  const w = Math.abs(r - l);
  const h = Math.abs(b - t);
  const into = [w, h, w, h] as Point4;

  const {id} = useFiber();  
  const pickers: any[] = [];
  const sizes: Point[] = [];
  const offsets: Point[] = [];

  let {transform} = useTransformContext();

  // Global X/Y flip
  const flip = useOne(() => [0, 0] as Point);
  flip[0] = (l > r) ? l + r : 0;
  flip[1] = (t > b) ? b + t : 0;

  // Global X/Y shift
  const shift = useOne(() => [0, 0] as Point);
  shift[0] = (placement[0] - 1.0) / 2 * into[0];
  shift[1] = (placement[1] - 1.0) / 2 * into[1];

  const bound = useBoundShader(getLayoutPosition, [flip, shift]);
  transform = useMemo(() => transform ? chainTo(transform, bound) : bound, [transform, bound]);

  // Render children into root container
  const out = [] as LiveElement[];
  for (const {margin, fit, absolute} of els) {
    const {
      size,
      render,
      pick,
    } = fit(into);

    const [w, h] = absolute ? into : size;
    const [ml, mt] = margin;
    const layout = [left + ml, top + mt, left + ml + w, top + mt + h] as Rectangle;
    
    sizes.push([w, h]);
    offsets.push([left + ml, top + mt]);

    if (pick) pickers.push((x: number, y: number, scroll: boolean = false) =>
      pick(x, y, layout[0], layout[1], layout[2], layout[3], scroll));

    const el = render(layout, layout, null, null, transform);

    if (Array.isArray(el)) out.push(...el);
    else if (el) out.push(el);
  }

  // Picking goes front-to-back
  pickers.reverse();

  // Inspectable layout
  inspect({
    layout: {
      into,
      size: into,
      sizes,
      offsets,
    },
  });
  if (hovered) out.push(...makeBoxInspectLayout(id, sizes, offsets)([0, 0, 0, 0], [0, 0, 0, 0], null, null, transform));

  // Add scroll listener
  out.push(keyed(Scroller, -2, pickers, flip, shift));
  
  // Interactive inspect handler
  if (toggleInspect) out.push(keyed(Inspect, -1, pickers, flip, shift));

  return fragment(out);
};

const screenToView = (projectionMatrix: mat4, x: number, y: number) => {
  const v = [x, y, 0.5, 1.0] as any;
  const m = mat4.create();
  mat4.invert(m, projectionMatrix);
  vec3.transformMat4(v, v, m);
  return [v[0], v[1]];
};

export const Scroller = (pickers: any[], flip: [number, number], shift: [number, number]) => {
  const { useWheel } = useContext(WheelContext);
  const { uniforms: viewUniforms } = useContext(ViewContext);
  const {
    viewPixelRatio: { current: dpi },
    viewSize: { current: [width, height] },
    projectionMatrix: { current: matrix },
  } = viewUniforms;

  const { wheel } = useWheel();
  const [px, py] = screenToView(matrix, wheel.x / width * dpi * 2.0 - 1.0, 1.0 - wheel.y / height * dpi * 2.0);

  const versionRef = useOne(() => ({current: 0}));
  let version = versionRef.current;

  useOne(() => {
    const { moveX, moveY, stopped } = wheel;
    if (stopped) return;

    let x = px - shift[0];
    let y = py - shift[1];
    if (flip[0]) x = flip[0] - x;
    if (flip[1]) y = flip[1] - y;

    for (const picker of pickers) {
      const picked = picker(x, y, true);
      if (picked) {
        const [id, rectangle, onScroll] = picked;
        if (onScroll) onScroll(moveX, moveY);
        version = versionRef.current = incrementVersion(versionRef.current);
        return;
      }
    }
  }, wheel);

  return useOne(() => signal(), version);
}

export const Inspect = (pickers: any[], flip: [number, number], shift: [number, number]) => {
  const { id } = useFiber();
  const { useMouse } = useContext(MouseContext);
  const { uniforms: viewUniforms } = useContext(ViewContext);
  const {
    viewPixelRatio: { current: dpi },
    viewSize: { current: [width, height] },
    projectionMatrix: { current: matrix },
  } = viewUniforms;
  
  const setHighlight = useInspectorSelect();

  const { mouse, pressed } = useMouse();
  const [px, py] = screenToView(matrix, mouse.x / width * dpi * 2.0 - 1.0, 1.0 - mouse.y / height * dpi * 2.0);

  const picked = useOne(() => {
    let x = px - shift[0];
    let y = py - shift[1];
    if (flip[0]) x = flip[0] - x;
    if (flip[1]) y = flip[1] - y;
    for (const picker of pickers) {
      const picked = picker(x, y);
      if (picked) return picked;
    }
  }, [pickers, flip, shift]);

  if (!picked) return null;

  const [pickedId, rectangle] = picked;
  useOne(() => setHighlight(pickedId ?? null), pickedId);
  useOne(() => pressed.left && setHighlight(pickedId ?? null, true), pressed.left);

  return null;
}
