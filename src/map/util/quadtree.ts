import type { QuadTreeRoot, QuadTreeNode } from '../types';

export const gatherQuadTree = <T>(
  tree: QuadTreeRoot<T>,
  inclusive: boolean,
  shouldSplit: (node: QuadTreeNode<T>) => boolean | null,
): [
  QuadTreeNode<T>[],
  number[],
  number[],
] => gatherQuadTreeNode(tree.root, inclusive, shouldSplit);

export const gatherQuadTreeNode = <T>(
  node: QuadTreeNode<T> | null,
  inclusive: boolean,
  shouldSplit: (node: QuadTreeNode<T>) => boolean | null,
): [
  QuadTreeNode<T>[],
  number[],
  number[],
] => {
  const visibles: QuadTreeNode<T>[] = [];
  const missing: number[] = [];
  const collapsable: number[] = [];

  const queue: QuadTreeNode<T>[] = [];
  if (node) queue.push(node);
  else missing.push(0);

  while (queue.length) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const next = queue.shift()!;
    const {nodes} = next;

    const split = shouldSplit(next);

    if (split) {
      if (next.nodes && next.nodes.indexOf(null) === -1) {
        queue.push(...next.nodes as QuadTreeNode<T>[]);
        if (inclusive) visibles.push(next);
      }
      else {
        const x = next.x * 2;
        const y = next.y * 2;
        const zoom = next.zoom + 1;

        nodes?.[0] || missing.push(getQuadTreeKey(x, y, zoom));
        nodes?.[1] || missing.push(getQuadTreeKey(x + 1, y, zoom));
        nodes?.[2] || missing.push(getQuadTreeKey(x, y + 1, zoom));
        nodes?.[3] || missing.push(getQuadTreeKey(x + 1, y + 1, zoom));

        visibles.push(next);
      }
    }
    else {
      if (split == false) visibles.push(next);
      if (next.nodes) collapsable.push(next.key);
    }
  }

  collapsable.sort(() => Math.random() * 2 - 1);

  return [visibles, missing, collapsable];
};

export const makeQuadTreeNode = <T>(key: number, data: T): QuadTreeNode<T> => {
  const [x, y, zoom] = parseQuadTreeKey(key);
  
  return {
    key,

    x,
    y,
    zoom,

    data,
    nodes: null,
  };
};

export const getQuadTreeKey = (x: number, y: number, zoom: number) => (zoom << 20) + (y << 10) + (x << 0);
export const parseQuadTreeKey = (v: number) => [v & 0x3FF, (v >> 10) & 0x3FF, (v >> 20) & 0x3FF];

export const getQuadTreeNodeIndex = (x: number, y: number) => (x & 1) + ((y & 1) << 1);

export const addQuadTreeNode = <T>(tree: QuadTreeRoot<T>, node: QuadTreeNode<T>) => {
  const {root, count} = tree;
  const {x, y, zoom} = node;

  if (!root) {
    if (zoom === 0) return {root: node, count: 1};
    throw new Error("Insert into non-existent tree");
  }

  let n = root;
  for (let z = 0; z < zoom - 1; ++z) {
    const gx = (x >>> (zoom - z - 1)) & 1;
    const gy = (y >>> (zoom - z - 1)) & 1;

    const gi = getQuadTreeNodeIndex(gx, gy); 
    const next = n.nodes?.[gi];
    if (next == null) throw new Error("Insert into non-existent node");

    n = next;
  }

  if (n.nodes == null) n.nodes = [null, null, null, null];

  const ni = getQuadTreeNodeIndex(x, y);
  n.nodes[ni] = node;

  return {root, count: count + countQuadTreeNodes(node)};
};

export const collapseQuadTreeNode = <T>(tree: QuadTreeRoot<T>, key: number) => {
  const {root, count} = tree;
  const [x, y, zoom] = parseQuadTreeKey(key);

  if (!root) {
    throw new Error("Remove from non-existent tree");
  }

  let n = root;
  for (let z = 0; z < zoom; ++z) {
    const gx = (x >>> (zoom - z - 1)) & 1;
    const gy = (y >>> (zoom - z - 1)) & 1;

    const gi = getQuadTreeNodeIndex(gx, gy); 
    const next = n.nodes?.[gi];
    if (next == null) throw new Error("Remove from non-existent node");

    n = next;
  }

  const {nodes} = n;
  if (!nodes) throw new Error("Collapsing leaf node");

  let c = 0;
  for (const n of nodes) if (n) {
    c += countQuadTreeNodes(n);
  }
  n.nodes = null;

  return {root, count: count - c};
};

export const removeQuadTreeNode = <T>(tree: QuadTreeRoot<T>, key: number) => {
  const {root, count} = tree;
  const [x, y, zoom] = parseQuadTreeKey(key);

  if (!root) {
    throw new Error("Remove from non-existent tree");
  }

  let n = root;
  for (let z = 0; z < zoom - 1; ++z) {
    const gx = (x >>> (zoom - z - 1)) & 1;
    const gy = (y >>> (zoom - z - 1)) & 1;

    const gi = getQuadTreeNodeIndex(gx, gy); 
    const next = n.nodes?.[gi];
    if (next == null) throw new Error("Remove from non-existent node");

    n = next;
  }

  const ni = getQuadTreeNodeIndex(x, y);
  const prev = n.nodes?.[ni];

  if (n.nodes == null || prev == null) throw new Error("Removing non-existent node");

  n.nodes[ni] = null;

  return {root, count: count - countQuadTreeNodes(prev)};
};

export const countQuadTreeNodes = <T>(node: QuadTreeNode<T>) => {
  const {nodes} = node;

  let c = 1;
  if (!nodes) return c;

  for (const n of nodes) if (n) c += countQuadTreeNodes(n);
  return c;
};
