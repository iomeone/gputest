import type { LiveElement } from '../live';
import type { QuadTreeKey, QuadTreeNode, QuadTreeLODStrategy, QuadTreeRoot } from './types';

import { fence, gather, keyed, memo, yeet, useAwait, useMemo, useOne, useState } from '../live';
import { toMurmur53, mixBits53 } from '../state';
import { useMatrixContext, useViewContext, usePerFrame, getRenderFunc } from '../workbench';

import { gatherQuadTree, makeQuadTreeNode, parseQuadTreeKey, addQuadTreeNode, collapseQuadTreeNode } from './util/quadtree';

const DEBUG = false;

export type QuadTreeProps<T> = {
  strategy: QuadTreeLODStrategy<T>,
  fetch: (node: QuadTreeKey) => Promise<T>,

  inclusive?: boolean,
  maxFetches?: number,
  maxCached?: number,

  render?: (node: QuadTreeNode<T>) => LiveElement,
  children?: (node: QuadTreeNode<T>) => LiveElement,
};

type QuadTreeTileLoaderProps<T> = {
  k: number,
  fetch: (node: QuadTreeKey) => T,
};

//type QuadTreeTileRenderProps<T> = {
//  node: QuadTreeNode<T>,
//  render?: (node: QuadTreeNode<T>) => LiveElement,
//};

type JSXRender<T> = (node: QuadTreeNode<T>) => LiveElement;

const EMPTY_QUAD_TREE: QuadTreeRoot<any> = {root: null, count: 0};

// Return type `any` needed to avoid JSX type confusion between Live and React on generic LC<T>
export const QuadTree = <T>(props: QuadTreeProps<T>): any => {
  const {
    strategy,
    fetch,
    inclusive = false,
    maxFetches = 16,
    maxCached = Infinity,
  } = props;

  const parent = useMatrixContext();

  const {uniforms} = useViewContext();
  const render = getRenderFunc(props);
  if (!render) return null;
  
  const gatherTreeNode = useMemo(() => strategy(uniforms, parent), [strategy, uniforms, parent]);
  const loadJSX = (key: number) => keyed(QuadTreeTileLoader, key, {k: key, fetch});

  // Cache user-supplied JSX to avoid any redundant re-rendering
  const jsxRenderCache = useOne(() => {
    const cache = new Map<number, LiveElement>();
    return (render: JSXRender<T>) => (node: QuadTreeNode<T>) => {
      const cached = cache.get(node.key);
      if (cached) return cached;

      const jsx = render(node);
      if ((jsx as any)?.key == null) throw new Error("QuadTree render JSX must have key");
      cache.set(node.key, jsx);
      return jsx;
    };
  }, render);

  // Using `memo(...)` on a child component would also work, but is not as efficient
  //const renderJSX = (node: QuadTreeNode<any>) => keyed(QuadTreeTileRender, node.key, {node, render});  
  const renderJSX = jsxRenderCache(render);

  const Run = () => {
    usePerFrame();

    const [tree, setTree] = useState<QuadTreeRoot<T>>(EMPTY_QUAD_TREE);
    const [visibles, missing, collapsable] = gatherQuadTree(tree, inclusive, gatherTreeNode);

    const missingHash = toMurmur53(missing) + maxFetches;
    const fetches = useOne(() => missing.slice(0, maxFetches).map(loadJSX), missingHash);

    const visiblesHash = visibles.reduce((a, b) => mixBits53(a, b.key), 0);
    const rendered = useOne(() => visibles.map(renderJSX), visiblesHash);

    return [
      rendered,
      gather(fetches, (nodes: QuadTreeNode<any>[]) => {
        DEBUG && console.log('[QuadTree]', {total: tree?.count ?? 0, visibles: visibles.length, missing: missing.length, fetched: nodes.length, collapsable: collapsable.length});

        // We mutate `tree` state here during render, which is allowed in Live.
        // Each fetched result will only be used once, as the render will rewind and remove the fetch.
        const toCollapse = Math.min(collapsable.length, tree.count + nodes.length - maxCached);
        if (toCollapse > 0) {
          setTree(tree => {
            for (const key of collapsable.slice(0, toCollapse)) {
              const [x, y, zoom] = parseQuadTreeKey(key);
              DEBUG && console.log('[QuadTree] Collapse node', x, y, zoom);
              tree = collapseQuadTreeNode(tree, key);
            }
            return tree;
          });          
        }
        if (nodes.length) {
          setTree(tree => {
            for (const node of nodes) {
              const {x, y, zoom} = node;
              DEBUG && console.log('[QuadTree] Add node', x, y, zoom, node);
              tree = addQuadTreeNode(tree, node);
            }

            return tree;
          });
        }
        return null;
      }),
    ];
  };

  return fence(null, Run);
};

//const QuadTreeTileRender = memo((props: QuadTreeTileRenderProps) => {
//  const {node, render} = props;
//  return render(node);
//}, 'QuadTreeTileRender');

const QuadTreeTileLoader = memo(<T>(props: QuadTreeTileLoaderProps<T>) => {
  const {k, fetch} = props;

  const [value, error] = useAwait(async () => {
    const [x, y, zoom] = parseQuadTreeKey(k);
    DEBUG && console.log('[QuadTree] Load node', x, y, zoom);

    const data = await fetch({x, y, zoom});
    const node = makeQuadTreeNode(k, data);
    return node;
  }, [k, fetch]);
  
  if (error) console.error(error)
  
  return value ? yeet(value) : null;
}, 'QuadTreeTileLoader');
