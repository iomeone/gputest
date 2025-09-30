import type { LiveFiber, Task } from './types';
import {
  use, keyed, detach, provide, capture, gather, yeet, reconcileTo, quoteTo, unquote,
  PROVIDE,
  makeContext, makeCapture, makeReconciler,
} from './builtin';
import { memoArgs, useState, useContext, useCapture } from './hooks';
import { renderSync } from './tree';
import { formatTree } from './debug';

const seq = (n: number, s: number = 0, d: number = 1): number[] => Array.from({ length: n }).map((_, i: number) => s + d * i);

it("mounts", () => {

  const Root = () => use(Node);
  const Node = () => {};

  const result = renderSync(use(Root));

  expect(result.host).toBeTruthy();
  if (!result.host) return;

  expect(result.f).toBe(Root);
  expect(result.mount).toBeTruthy();
  if (!result.mount) return;

  const node = result.mount;
  expect(node && node.f).toBe(Node);
});

it("mounts multiple", () => {

  const Root = () => [
    keyed(Node, '1'),
    keyed(Node, '2'),
  ];

  const Node = () => {};

  const result = renderSync(use(Root));
  expect(result.f).toBe(Root);
  expect(result.mounts).toBeTruthy();
  if (!result.mounts) return;

  const node1 = result.mounts.get('1');
  const node2 = result.mounts.get('2');
  expect(node1 && node1.f).toBe(Node);
  expect(node2 && node2.f).toBe(Node);
});

it("detaches a subfiber", () => {

  let keepSubFiber: LiveFiber<any> | null = null;

  const Root = () =>
    detach(use(Sub), (render: () => void, mount: LiveFiber<any>) => {
      keepSubFiber = mount;
      render();
    });

  const Sub = () => use(Node);
  const Node = () => {};

  const result = renderSync(use(Root));
  expect(result.f).toBe(Root);

  expect(result.mount).toBeTruthy();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  expect(result.mount!.next).toBeTruthy();

  expect(keepSubFiber).toBeTruthy();
  if (keepSubFiber != null) {
    const {mount} = keepSubFiber;
    // @ts-ignore
    expect(keepSubFiber.f).toBe(Sub);
    // @ts-ignore
    expect(mount && mount.f).toBe(Node);
  }

});

it("renders implicit keys with nulls", () => {

  const rendered = {
    root: 0,
    node: 0,
  };
  let trigger = null as Task | null;
  const setTrigger = (f: Task) => trigger = f;

  const Root = () => {
    const [value, setValue] = useState(0);
    setTrigger(() => setValue(1));

    rendered.root++;
    return [
      use(Node),
      null,
      value ? null : use(Node),
      value ? use(Node) : null,
      use(Node),
    ];
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Node = (x?: number) => {
    rendered.node++;
  };

  const result = renderSync(use(Root));
  expect(result.host).toBeTruthy();
  if (!result.host) return;

  const {host: {flush, __stats: stats}} = result;

  expect(result.f).toBe(Root);
  expect(result.mounts).toBeTruthy();
  if (result.mounts) {
    expect(result.order).toEqual([0, 2, 4]);
  }

  expect(rendered.root).toBe(1);
  expect(rendered.node).toBe(3);

  expect(stats.mounts).toBe(4);
  expect(stats.unmounts).toBe(0);
  expect(stats.updates).toBe(0);
  expect(stats.dispatch).toBe(1);

  if (trigger) trigger();
  if (flush) flush();

  expect(result.f).toBe(Root);
  expect(result.mounts).toBeTruthy();
  if (result.mounts) {
    expect(result.order).toEqual([0, 3, 4]);
  }

  expect(rendered.root).toBe(2);
  expect(rendered.node).toBe(6);

  expect(stats.mounts).toBe(5);
  expect(stats.unmounts).toBe(1);
  expect(stats.updates).toBe(2);
  expect(stats.dispatch).toBe(2);

});

it("reacts on the root (setter form)", () => {

  const rendered = {
    root: 0,
    node: 0,
  };
  let trigger = null as Task | null;
  const setTrigger = (f: Task) => trigger = f;

  const Root = () => {
    rendered.root++;

    const [, setValue] = useState(0);
    setTrigger(() => setValue(1));

    return keyed(Node, Math.random());
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Node = (x?: number) => {
    rendered.node++;
  };

  const result = renderSync(use(Root));
  expect(result.host).toBeTruthy();
  expect(result.mount).toBeTruthy();
  if (!result.host) return;
  if (!result.mount) return;

  const {host: {flush}} = result;

  expect(result.f).toBe(Root);
  const node1 = result.mount;
  expect(node1 && node1.f).toBe(Node);

  expect(rendered.root).toBe(1);
  expect(rendered.node).toBe(1);

  if (trigger) trigger();
  if (flush) flush();

  expect(result.f).toBe(Root);
  const node2 = result.mount;
  expect(node2 && node2.f).toBe(Node);

  expect(rendered.root).toBe(2);
  expect(rendered.node).toBe(2);

});

it("reacts on the root (reducer form)", () => {

  const rendered = {
    root: 0,
    node: 0,
  };
  let trigger = null as Task | null;
  const setTrigger = (f: Task) => trigger = f;

  const Root = () => {
    rendered.root++;

    const [, setValue] = useState(0);
    setTrigger(() => setValue((s: number) => s + 1));

    return keyed(Node, Math.random());
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Node = (x?: number) => {
    rendered.node++;
  };

  const result = renderSync(use(Root));
  expect(result.host).toBeTruthy();
  expect(result.mount).toBeTruthy();
  if (!result.host) return;
  if (!result.mount) return;

  const {host: {flush}} = result;

  expect(result.f).toBe(Root);
  const node1 = result.mount;
  expect(node1 && node1.f).toBe(Node);

  expect(rendered.root).toBe(1);
  expect(rendered.node).toBe(1);

  if (trigger) trigger();
  if (flush) flush();

  expect(result.f).toBe(Root);
  const node2 = result.mount;
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

  const Root = () => {
    const [, setValue] = useState(0);
    setTrigger(() => setValue(1));

    rendered.root++;
    return [
      keyed(Node, '1', Math.random()),
      keyed(Node, '2', Math.random()),
      keyed(Node, '3' + rendered.root, Math.random()),
    ];
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Node = (x?: number) => {
    rendered.node++;
  };

  const result = renderSync(use(Root));
  expect(result.host).toBeTruthy();
  if (!result.host) return;

  const {host: {flush, __stats: stats}} = result;

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
  expect(stats.dispatch).toBe(1);

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
  expect(stats.updates).toBe(2);
  expect(stats.dispatch).toBe(2);

});

it("reacts and remounts a sub tree", () => {

  const rendered = {
    root: 0,
    subroot: 0,
    node: 0,
  };
  let trigger = null as Task | null;
  const setTrigger = (f: Task) => trigger = f;

  const Root = () => {
    rendered.root++;
    return [
      keyed(SubRoot, 'subroot'),
    ];
  };

  const SubRoot = () => {
    const [, setValue] = useState(0);
    setTrigger(() => setValue(1));

    rendered.subroot++;
    return [
      keyed(Node, '1', Math.random()),
      keyed(Node, '2', Math.random()),
      keyed(Node, '3' + rendered.subroot, Math.random()),
    ];
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Node = (x?: number) => {
    rendered.node++;
    return;
  };

  const result = renderSync(use(Root));
  expect(result.host).toBeTruthy();
  expect(result.mounts).toBeTruthy();
  if (!result.host) return;
  if (!result.mounts) return;

  const {host: {flush, __stats: stats}} = result;

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
  expect(stats.dispatch).toBe(1);

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
  expect(stats.updates).toBe(2);
  expect(stats.dispatch).toBe(2);

});

it("coalesces updates", () => {

  const rendered = {
    root: 0,
    node: 0,
  };
  let trigger1 = null as Task | null;
  let trigger2 = null as Task | null;
  const setTrigger1 = (f: Task) => trigger1 = f;
  const setTrigger2 = (f: Task) => trigger2 = f;

  const Root = () => {
    rendered.root++;

    const [, setValue] = useState(0);
    setTrigger1(() => setValue(1));

    return keyed(Node, Math.random());
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Node = (x?: number) => {
    rendered.node++;

    const [, setValue] = useState(0);
    setTrigger2(() => setValue(1));
  };

  const result = renderSync(use(Root));
  expect(result.host).toBeTruthy();
  expect(result.mount).toBeTruthy();
  if (!result.host) return;
  if (!result.mount) return;

  const {host: {flush}} = result;

  expect(result.f).toBe(Root);
  const node1 = result.mount;
  expect(node1 && node1.f).toBe(Node);

  expect(rendered.root).toBe(1);
  expect(rendered.node).toBe(1);

  if (trigger1) trigger1();
  if (trigger2) trigger2();
  if (flush) flush();

  expect(result.f).toBe(Root);
  const node2 = result.mount;
  expect(node2 && node2.f).toBe(Node);

  expect(rendered.root).toBe(2);
  expect(rendered.node).toBe(2);

});

it("updates with memo in the way", () => {

  const rendered = {
    root: 0,
    memo: 0,
    node: 0,
  };
  let trigger1 = null as Task | null;
  let trigger2 = null as Task | null;
  const setTrigger1 = (f: Task) => trigger1 = f;
  const setTrigger2 = (f: Task) => trigger2 = f;

  const Root = () => {
    rendered.root++;

    const [, setValue] = useState(0);
    setTrigger1(() => setValue(1));

    return use(Memo);
  };

  const Memo = memoArgs(() => {
    rendered.memo++;

    return keyed(Node, Math.random());
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Node = (x?: number) => {
    rendered.node++;

    const [, setValue] = useState(0);
    setTrigger2(() => setValue(1));
  };

  const result = renderSync(use(Root));
  expect(result.host).toBeTruthy();
  expect(result.mount).toBeTruthy();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  expect(result.mount!.mount).toBeTruthy();
  if (!result.host) return;
  if (!result.mount) return;
  if (!result.mount.mount) return;

  const {host: {flush}} = result;

  expect(result.f).toBe(Root);
  const memo1 = result.mount;
  expect(memo1 && memo1.f).toBe(Memo);
  const node1 = result.mount.mount;
  expect(node1 && node1.f).toBe(Node);

  expect(rendered.root).toBe(1);
  expect(rendered.memo).toBe(1);
  expect(rendered.node).toBe(1);

  if (trigger1) trigger1();
  if (trigger2) trigger2();
  if (flush) flush();

  expect(result.f).toBe(Root);
  const memo2 = result.mount;
  expect(memo2 && memo2.f).toBe(Memo);
  const node2 = result.mount.mount;
  expect(node2 && node2.f).toBe(Node);

  expect(rendered.root).toBe(2);
  expect(rendered.memo).toBe(1);
  expect(rendered.node).toBe(2);

});

it("updates context with memo in the way", () => {

  const context = makeContext<number>(-1);

  const rendered = {
    root: 0,
    memo: 0,
    node: 0,
    value: -1,
  };
  let trigger = null as Task | null;
  const setTrigger = (f: Task) => trigger = f;

  const Root = () => {
    rendered.root++;

    const [value, setValue] = useState(0);
    setTrigger(() => setValue(1));

    return provide(context, value, use(Memo));
  };

  const Memo = memoArgs(() => {
    rendered.memo++;

    return use(Node);
  });

  const Node = () => {
    rendered.node++;
    const value = useContext(context);
    rendered.value = value;
  };

  const result = renderSync(use(Root));
  expect(result.host).toBeTruthy();
  expect(result.mount).toBeTruthy();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  expect(result.mount!.mount).toBeTruthy();
  if (!result.host) return;
  if (!result.mount) return;
  if (!result.mount.mount) return;

  const {host: {flush}} = result;

  expect(result.f).toBe(Root);
  const provide1 = result.mount;
  expect(provide1 && provide1.f).toBe(PROVIDE);
  const memo1 = result.mount.mount;
  expect(memo1 && memo1.f).toBe(Memo);
  const node1 = result.mount.mount.mount;
  expect(node1 && node1.f).toBe(Node);

  expect(rendered.root).toBe(1);
  expect(rendered.memo).toBe(1);
  expect(rendered.node).toBe(1);
  expect(rendered.value).toBe(0);

  if (trigger) trigger();
  if (flush) flush();

  expect(result.f).toBe(Root);
  const provide2 = result.mount;
  expect(provide2 && provide2.f).toBe(PROVIDE);
  const memo2 = result.mount.mount;
  expect(memo2 && memo2.f).toBe(Memo);
  const node2 = result.mount.mount.mount;
  expect(node2 && node2.f).toBe(Node);

  expect(rendered.root).toBe(2);
  expect(rendered.memo).toBe(1);
  expect(rendered.node).toBe(2);
  expect(rendered.value).toBe(1);

});

it("does not update context if value is the same", () => {

  const context = makeContext<number>(-1);

  const rendered = {
    root: 0,
    memo: 0,
    node: 0,
    value: -1,
  };
  let trigger = null as Task | null;
  const setTrigger = (f: Task) => trigger = f;

  const Root = () => {
    rendered.root++;

    const [, setValue] = useState(0);
    setTrigger(() => setValue(1));

    return provide(context, 0, memoChild);
  };

  const Memo = memoArgs(() => {
    rendered.memo++;

    return use(Node);
  });

  const Node = () => {
    rendered.node++;
    const value = useContext(context);
    rendered.value = value;
  };

  const memoChild = use(Memo);

  const result = renderSync(use(Root));
  expect(result.host).toBeTruthy();
  expect(result.mount).toBeTruthy();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  expect(result.mount!.mount).toBeTruthy();
  if (!result.host) return;
  if (!result.mount) return;
  if (!result.mount.mount) return;

  const {host: {flush}} = result;

  expect(result.f).toBe(Root);
  const provide1 = result.mount;
  expect(provide1 && provide1.f).toBe(PROVIDE);
  const memo1 = result.mount.mount;
  expect(memo1 && memo1.f).toBe(Memo);
  const node1 = result.mount.mount.mount;
  expect(node1 && node1.f).toBe(Node);

  expect(rendered.root).toBe(1);
  expect(rendered.memo).toBe(1);
  expect(rendered.node).toBe(1);
  expect(rendered.value).toBe(0);

  if (trigger) trigger();
  if (flush) flush();

  expect(result.f).toBe(Root);
  const provide2 = result.mount;
  expect(provide2 && provide2.f).toBe(PROVIDE);
  const memo2 = result.mount.mount;
  expect(memo2 && memo2.f).toBe(Memo);
  const node2 = result.mount.mount.mount;
  expect(node2 && node2.f).toBe(Node);

  expect(rendered.root).toBe(2);
  expect(rendered.memo).toBe(1);
  expect(rendered.node).toBe(1);
  expect(rendered.value).toBe(0);

});

it("gathers yeeted values", () => {

  const Root = () => {
    return gather([
      yeet(1),
      use(Value),
      yeet(3),
    ], (values: number[]) => use(Node, values));
  };

  const Value = () => {
    return yeet(2);
  };

  const Node = () => {};

  const result = renderSync(use(Root));
  if (!result.host) return;

  const {host: {flush}} = result;
  if (flush) flush();

  expect(formatTree(result)).toMatchSnapshot();
});

it("captures values", () => {

  const context = makeCapture<number>();

  const Root = () => {
    return capture(context, [
      use(Value(1)),
      use(Value(2)),
      use(Value(3)),
    ], (list: number[]) => use(Node, list));
  };

  const Value = (value: number) => () => useCapture(context, value);
  const Node = () => {};

  const result = renderSync(use(Root));
  if (!result.host) return;

  const {host: {flush}} = result;
  if (flush) flush();

  expect(formatTree(result)).toMatchSnapshot();
});

it("yeets from capture", () => {

  const context = makeCapture<number>();

  const Root = () => {
    return gather(capture(context, [
      yeet(1),
      yeet(2),
      use(Value(3)),
      use(Value(4)),
    ], (list: number[]) => yeet(list)), (values: number[]) => use(Node, values));
  };

  const Value = (value: number) => () => useCapture(context, value);
  const Node = () => {};

  const result = renderSync(use(Root));
  if (!result.host) return;

  const {host: {flush}} = result;
  if (flush) flush();

  expect(formatTree(result)).toMatchSnapshot();
});

it("renders quoted tree", () => {

  const Reconciler = makeReconciler('Test');

  const Root = () => {
    return reconcileTo(Reconciler, [
      use(Node),
      quoteTo(Reconciler, use(Tree)),
      use(Node),
    ]);
  };

  const Tree = () => use(Node, use(Node, use(Node)));

  const Node = (children) => {
    return children;
  };

  const result = renderSync(use(Root));
  if (!result.host) return;

  const {host: {flush}} = result;
  if (flush) flush();

  expect(formatTree(result)).toMatchSnapshot();
});

it("renders quoted/unquoted trees", () => {
  const Reconciler = makeReconciler('Test');

  const Root = () => {
    return [
      reconcileTo(Reconciler, quoteTo(Reconciler,
        use(Second,
          use(Second,
            unquote(use(First, quoteTo(Reconciler, use(Second, unquote(use(First, use(First, quoteTo(Reconciler, use(Second)))))))))
          )
        )
      )),
    ];
  };

  const First = (children) => children;
  const Second = (children) => children;

  const result = renderSync(use(Root));
  if (!result.host) return;

  const {host: {flush}} = result;
  if (flush) flush();

  expect(formatTree(result)).toMatchSnapshot();
});

it("renders quote/unquote pairs", () => {
  const Reconciler = makeReconciler('Test');

  const Root = () => {
    return reconcileTo(Reconciler, use(First,
      quoteTo(Reconciler,
        use(Second,
          use(Second,
            unquote(quoteTo(Reconciler, use(Second, unquote(
              use(First, quoteTo(Reconciler, unquote(use(First, use(First, quoteTo(Reconciler,
                use(Second)
              ))))))
            ))))
          )
        )
      )),
    );
  };

  const First = (children) => children;
  const Second = (children) => children;

  const result = renderSync(use(Root));
  if (!result.host) return;

  const {host: {flush}} = result;
  if (flush) flush();

  expect(formatTree(result)).toMatchSnapshot();
});

it("render reordering", () => {
  // insert 3 distant fibers in the queue via a context invalidation
  // then change their order mid-render
  //
  // priority queue should be reordered
  // use stack slice depth 0 to ensure fenced operation

  const context = makeContext<number>(-1);

  const rendered = {
    root: 0,
    order: 0,
    node: 0,
    ids: [],
  };
  let trigger = null as Task | null;
  const setTrigger = (f: Task) => trigger = f;

  const Root = () => {
    rendered.root++;

    const [value, setValue] = useState(0);
    setTrigger(() => setValue(1));

    return provide(context, value, use(Order));
  };

  const N = 3;
  const Order = memoArgs(() => {
    rendered.order++;

    const value = useContext(context);
    const getKey = (i: number) => (i + value) % N;
    const order = seq(N).map(getKey);

    return order.map(key => keyed(Node, key, {id: key}));
  });

  const Node = ({id}) => {
    rendered.node++;
    useContext(context);
    rendered.ids.push(id);
  };

  const result = renderSync(use(Root), null, {stackSliceDepth: 0, strictQueueOrder: true});
  expect(result.host).toBeTruthy();
  if (!result.host) return;

  const {host: {flush}} = result;
  expect(formatTree(result)).toMatchSnapshot();
  expect(rendered.ids).toEqual([0, 1, 2]);

  if (trigger) trigger();
  if (flush) flush();

  expect(formatTree(result)).toMatchSnapshot();
  expect(rendered.ids).toEqual([0, 1, 2, 1, 2, 0]);

});