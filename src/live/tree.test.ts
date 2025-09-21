import { LiveContext, Mounts, Task } from './types';
import { defer, fork, makeSubContext } from './live';
import { useState } from './hooks';
import { renderSync, renderContext } from './tree';

it("mounts", () => {
  
  const Root = () => () => defer(Node)();
  const Node = () => () => {};
  
  const result = renderSync(defer(Root)());
  expect(result.f).toBe(Root);
  expect(result.mounts).toBeTruthy();
  if (result.mounts) {
    const node = result.mounts.get(0);
    expect(node && node.f).toBe(Node);
  }
  
});

it("mounts multiple", () => {
  
  const Root = () => () => [
    defer(Node, '1')(),
    defer(Node, '2')(),
  ];
  
  const Node = () => () => {};
  
  const result = renderSync(defer(Root)());
  expect(result.host).toBeTruthy();
  expect(result.mounts).toBeTruthy();
  if (!result.host) return;
  if (!result.mounts) return;

  expect(result.f).toBe(Root);
  const node1 = result.mounts.get('1');
  const node2 = result.mounts.get('2');
  expect(node1 && node1.f).toBe(Node);
  expect(node2 && node2.f).toBe(Node);
});

it("mounts a subcontext", () => {

  let subContext: LiveContext<any> | null = null;
  const Root = (context: LiveContext<any>) => {
    subContext = makeSubContext(context, defer(Sub)());
    return () => {
      renderContext(subContext!);
      return fork(subContext!);
    };
  }
  const Sub = () => () => defer(Node)();
  const Node = () => () => {};
  
  const result = renderSync(defer(Root)());
  expect(result.f).toBe(Root);

  expect(result.mounts!.size).toBe(1);
  expect(result.mounts!.get(0)!.mounts!.size).toBe(1);

  expect(subContext).toBeTruthy();
  if (subContext != null) {
    const {mounts} = subContext;
    if (mounts) {
      const node = (mounts as Mounts).get(0);
      expect(node && node.f).toBe(Node);
    }
  }
  
});

it("reacts on the root (setter)", () => {

  const rendered = {
    root: 0,
    node: 0,
  };
  let trigger = null as Task | null;
  const setTrigger = (f: Task) => trigger = f;

  const Root = (context: LiveContext<any>) => () => {
    rendered.root++;

    const [, setValue] = useState(context, 0)(0);
    setTrigger(() => setValue(1));

    return defer(Node)();
  };
  
  const Node = () => () => {
    rendered.node++;
  };

  const result = renderSync(defer(Root)());
  expect(result.host).toBeTruthy();
  expect(result.mounts).toBeTruthy();
  if (!result.host) return;
  if (!result.mounts) return;

  const {host: {__flush: flush}} = result;

  expect(result.f).toBe(Root);
  const node1 = result.mounts.get(0);
  expect(node1 && node1.f).toBe(Node);

  expect(rendered.root).toBe(1);
  expect(rendered.node).toBe(1);

  if (trigger) trigger();
  if (flush) flush();

  expect(result.f).toBe(Root);
  const node2 = result.mounts.get(0);
  expect(node2 && node2.f).toBe(Node);

  expect(rendered.root).toBe(2);
  expect(rendered.node).toBe(2);
    
});

it("reacts on the root (reducer)", () => {

  const rendered = {
    root: 0,
    node: 0,
  };
  let trigger = null as Task | null;
  const setTrigger = (f: Task) => trigger = f;

  const Root = (context: LiveContext<any>) => () => {
    rendered.root++;

    const [, setValue] = useState(context, 0)(0);
    setTrigger(() => setValue((s: number) => s + 1));

    return defer(Node)();
  };
  
  const Node = () => () => {
    rendered.node++;
  };

  const result = renderSync(defer(Root)());
  expect(result.host).toBeTruthy();
  expect(result.mounts).toBeTruthy();
  if (!result.host) return;
  if (!result.mounts) return;

  const {host: {__flush: flush}} = result;

  expect(result.f).toBe(Root);
  const node1 = result.mounts.get(0);
  expect(node1 && node1.f).toBe(Node);

  expect(rendered.root).toBe(1);
  expect(rendered.node).toBe(1);

  if (trigger) trigger();
  if (flush) flush();

  expect(result.f).toBe(Root);
  const node2 = result.mounts.get(0);
  expect(node2 && node2.f).toBe(Node);

  expect(rendered.root).toBe(2);
  expect(rendered.node).toBe(2);
    
});

it("reacts and remounts on the root", () => {

  const rendered = {
    root: 0,
    node: 0,
  };
  let trigger = null as Task | null;
  const setTrigger = (f: Task) => trigger = f;

  const Root = (context: LiveContext<any>) => () => {
    const [, setValue] = useState(context, 0)(0);
    setTrigger(() => setValue(1));

    rendered.root++;
    return [
      defer(Node, '1')(),
      defer(Node, '2')(),
      defer(Node, '3' + rendered.root)(),
    ];
  };

  const Node = () => () => {
    rendered.node++;
  };

  const result = renderSync(defer(Root)());
  expect(result.host).toBeTruthy();
  if (!result.host) return;

  const {host: {__flush: flush, __stats: stats}} = result;

  expect(result.f).toBe(Root);
  expect(result.mounts).toBeTruthy();
  if (result.mounts) {
    const node1 = result.mounts.get('1');
    const node2 = result.mounts.get('2');
    const node3 = result.mounts.get('31');
    const node4 = result.mounts.get('32');
    expect(node1 && node1.f).toBe(Node);
    expect(node2 && node2.f).toBe(Node);
    expect(node3 && node3.f).toBe(Node);
    expect(node4).toBe(undefined);
  }

  expect(rendered.root).toBe(1);
  expect(rendered.node).toBe(3);

  expect(stats.mounts).toBe(4);
  expect(stats.unmounts).toBe(0);
  expect(stats.updates).toBe(0);

  if (trigger) trigger();
  if (flush) flush();

  expect(result.f).toBe(Root);
  expect(result.mounts).toBeTruthy();
  if (result.mounts) {
    const node1 = result.mounts.get('1');
    const node2 = result.mounts.get('2');
    const node3 = result.mounts.get('31');
    const node4 = result.mounts.get('32');
    expect(node1 && node1.f).toBe(Node);
    expect(node2 && node2.f).toBe(Node);
    expect(node3).toBe(undefined);
    expect(node4 && node4.f).toBe(Node);
  }

  expect(rendered.root).toBe(2);
  expect(rendered.node).toBe(6);

  expect(stats.mounts).toBe(5);
  expect(stats.unmounts).toBe(1);
  expect(stats.updates).toBe(3);
    
});

it("reacts and remounts a sub tree", () => {

  const rendered = {
    root: 0,
    subroot: 0,
    node: 0,
  };
  let trigger = null as Task | null;
  const setTrigger = (f: Task) => trigger = f;

  const Root = () => () => {
    rendered.root++;
    return [
      defer(SubRoot, 'subroot')(),
    ];
  };

  const SubRoot = (context: LiveContext<any>) => () => {
    const [, setValue] = useState(context, 0)(0);
    setTrigger(() => setValue(1));

    rendered.subroot++;
    return [
      defer(Node, '1')(),
      defer(Node, '2')(),
      defer(Node, '3' + rendered.subroot)(),
    ];
  };

  const Node = () => () => {
    rendered.node++;
    return;
  };

  const result = renderSync(defer(Root)());
  expect(result.host).toBeTruthy();
  expect(result.mounts).toBeTruthy();
  if (!result.host) return;
  if (!result.mounts) return;

  const {host: {__flush: flush, __stats: stats}} = result;

  expect(result.f).toBe(Root);
  expect(result.mounts).toBeTruthy();

  const sub1 = result.mounts.get('subroot');
  const node1 = sub1 && sub1.mounts && sub1.mounts.get('31');
  expect(sub1 && sub1.f).toBe(SubRoot);
  expect(node1 && node1.f).toBe(Node);

  expect(rendered.root).toBe(1);
  expect(rendered.subroot).toBe(1);
  expect(rendered.node).toBe(3);

  expect(stats.mounts).toBe(5);
  expect(stats.unmounts).toBe(0);
  expect(stats.updates).toBe(0);

  if (trigger) trigger();
  if (flush) flush();

  expect(result.f).toBe(Root);
  expect(result.mounts).toBeTruthy();

  const sub2 = result.mounts.get('subroot');
  const node2 = sub2 && sub2.mounts && sub2.mounts.get('32');
  expect(sub2 && sub2.f).toBe(SubRoot);
  expect(node2 && node2.f).toBe(Node);

  expect(rendered.root).toBe(1);
  expect(rendered.subroot).toBe(2);
  expect(rendered.node).toBe(6);

  expect(stats.mounts).toBe(6);
  expect(stats.unmounts).toBe(1);
  expect(stats.updates).toBe(3);
    
});
