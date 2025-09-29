import { makeActionScheduler, makeDependencyTracker, makeDisposalTracker, makePaintRequester, compareFibers, isSubNode } from './util';

it("schedules actions", () => {
  let run = {a: 0, b: 0} as Record<string, number>;

  let fiber = {} as any;

  let flushed = 0;
  let captured = 0;
  let flush = () => {};
  let fibers: any[] = [];

  const dispatch = (f: any) => { 
    flushed++;
    flush = f;
  };

  const capture = (as: any[]) => {
    fibers = as;
    captured++;
  };

  const scheduler = makeActionScheduler(dispatch, capture);

  scheduler.schedule(fiber, () => run.a++);
  scheduler.schedule(fiber, () => run.b++);
  flush();

  expect(run.a).toBe(1);
  expect(run.b).toBe(1);
  expect(flushed).toBe(1);
  expect(captured).toBe(1);
  expect(fibers.length).toBe(1);

  scheduler.schedule(fiber, () => { run.a++; return false });
  flush();

  expect(run.a).toBe(2);
  expect(run.b).toBe(1);
  expect(flushed).toBe(2);
  expect(captured).toBe(1);
})

it("tracks disposal actions", () => {
  let run = {a: 0, b: 0} as Record<string, number>;

  let fiber = {} as any;

  const trash = makeDisposalTracker();
  trash.track(fiber, () => run.a++);
  trash.track(fiber, () => run.b++);

  trash.dispose(fiber);

  expect(run.a).toBe(1);
  expect(run.b).toBe(1);

  trash.dispose(fiber);

  expect(run.a).toBe(1);
  expect(run.b).toBe(1);

});

it("tracks dependencies", () => {
  let root = {} as any;
  let fiber1 = {} as any;
  let fiber2 = {} as any;

  const dependency = makeDependencyTracker();
  dependency.depend(fiber1, root.id);
  dependency.depend(fiber2, root.id);

  let visit = new Set(dependency.traceDown(root));
  expect(visit.size).toBe(2);
  expect(visit.has(fiber1)).toBe(true);
  expect(visit.has(fiber2)).toBe(true);

  dependency.undepend(fiber1, root.id);

  visit = new Set(dependency.traceDown(root));
  expect(visit.size).toBe(1);
  expect(visit.has(fiber2)).toBe(true);

});

it("resolves node ancestry", () => {
  
  const n1  = {depth: 0, path: [0]} as any;
  const n11 = {depth: 1, path: [0, 0]} as any;
  const n12 = {depth: 1, path: [0, 1]} as any;

  const n111 = {depth: 2, path: [0, 0, 0]} as any;
  const n1111 = {depth: 3, path: [0, 0, 0]} as any;

  const n11111 = {depth: 4, path: [0, 0, 0, 0]} as any;
  const n11112 = {depth: 4, path: [0, 0, 0, 1]} as any;

  expect(isSubNode(n1, n11)).toBe(true);
  expect(isSubNode(n1, n12)).toBe(true);
  expect(isSubNode(n1, n111)).toBe(true);
  expect(isSubNode(n1, n1111)).toBe(true);
  expect(isSubNode(n1, n11111)).toBe(true);
  expect(isSubNode(n1, n11112)).toBe(true);

  expect(isSubNode(n11, n1)).toBe(false);
  expect(isSubNode(n12, n1)).toBe(false);
  expect(isSubNode(n111, n1)).toBe(false);
  expect(isSubNode(n1111, n1)).toBe(false);
  expect(isSubNode(n11111, n1)).toBe(false);
  expect(isSubNode(n11112, n1)).toBe(false);

  expect(isSubNode(n11, n12)).toBe(false);
  expect(isSubNode(n12, n11)).toBe(false);

  expect(isSubNode(n11, n111)).toBe(true);
  expect(isSubNode(n11, n1111)).toBe(true);
  expect(isSubNode(n11, n11111)).toBe(true);
  expect(isSubNode(n11, n11112)).toBe(true);

  expect(isSubNode(n12, n111)).toBe(false);
  expect(isSubNode(n12, n1111)).toBe(false);
  expect(isSubNode(n12, n11111)).toBe(false);
  expect(isSubNode(n12, n11112)).toBe(false);

  expect(isSubNode(n111, n1111)).toBe(true);
  expect(isSubNode(n111, n11111)).toBe(true);
  expect(isSubNode(n111, n11112)).toBe(true);

  expect(isSubNode(n1111, n111)).toBe(false);
  expect(isSubNode(n11111, n111)).toBe(false);
  expect(isSubNode(n11112, n111)).toBe(false);

});

it("sorts fibers", () => {
  const lookup = new Map();
  lookup.set('key', 2);

  const n1  = {depth: 0, path: [0], keys: null} as any;
  const n11 = {depth: 1, path: [0, 0], keys: null} as any;
  const n12 = {depth: 1, path: [0, 1], keys: null} as any;
  const n1k = {depth: 1, path: [0, 'key'], keys: [1, lookup]} as any;

  const n111 = {depth: 2, path: [0, 0, 0], keys: null} as any;
  const n1111 = {depth: 3, path: [0, 0, 0], keys: null} as any;

  const n11111 = {depth: 4, path: [0, 0, 0, 0], keys: null} as any;
  const n11112 = {depth: 4, path: [0, 0, 0, 1], keys: null} as any;

  const list = [n11111, n1k, n11112, n1, n12, n11, n111, n1111];
  const sorted = [n1, n11, n111, n1111, n11111, n11112, n12, n1k];

  list.sort(compareFibers);
  expect(list).toEqual(sorted);
});
