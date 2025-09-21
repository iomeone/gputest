import { makeActionScheduler, makeDependencyTracker, makeDisposalTracker, makePaintRequester } from './util';

it("schedules actions", () => {
  let run = {a: 0, b: 0} as Record<string, number>;
  let flushed = [] as any[];

  let fiber = {} as any;

  const scheduler = makeActionScheduler();
  scheduler.bind((as: any[]) => flushed = as);

  scheduler.schedule(fiber, () => run.a++);
  scheduler.schedule(fiber, () => run.b++);

  scheduler.flush();

  expect(run.a).toBe(1);
  expect(run.b).toBe(1);
  expect(flushed.length).toBe(2);

  scheduler.flush();

  expect(run.a).toBe(1);
  expect(run.b).toBe(1);
  expect(flushed.length).toBe(0);
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
  dependency.depend(fiber1, root);
  dependency.depend(fiber2, root);

  let visit = new Set(dependency.invalidate(root));
  expect(visit.size).toBe(2);
  expect(visit.has(fiber1)).toBe(true);
  expect(visit.has(fiber2)).toBe(true);

  dependency.undepend(fiber1, root);

  visit = new Set(dependency.invalidate(root));
  expect(visit.size).toBe(1);
  expect(visit.has(fiber2)).toBe(true);

});

it("requests paints", (done) => {
  let run = {a: 0, b: 0} as Record<string, number>;
  let requested = 0;

  const raf = (f: any) => {
    requested++;
    setTimeout(f, 10);
  };
  const request = makePaintRequester(raf);
  
  request(() => run.a++);
  request(() => run.b++);

  setTimeout(() => {
    expect(requested).toBe(1);
    expect(run.a).toBe(1);
    expect(run.b).toBe(1);
    done();
  }, 30);
});