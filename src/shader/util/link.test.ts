import { getGraphOrder } from './link';

describe("getGraphOrder", () => {
  const A = 'A';
  const B = 'B';
  const C = 'C';
  const D = 'D';
  const E = 'E';
  const F = 'F';

  it("gets graph order", () => {
    const graph = new Map();
    graph.set(A, [B, C]);
    graph.set(B, [D]);
    graph.set(D, [E]);
    graph.set(C, [D]);

    const order = getGraphOrder(graph, A);
    expect(order).toMatchSnapshot();
  });

  it("detects cycles", () => {
    const graph = new Map();
    graph.set(A, [B, C]);
    graph.set(B, [D]);
    graph.set(C, [D, A]);

    try {
      getGraphOrder(graph, A);
    }
    catch (e: any) {
      expect(e.message).toMatch(/Cycle detected/);
    }
  });

  it("hoists leaf in graph", () => {
    const graph = new Map();
    graph.set(A, [F, B, C]);
    graph.set(B, [D]);
    graph.set(D, [E]);
    graph.set(C, [D]);

    // F is hoisted
    const order = getGraphOrder(graph, A, new Set([F]));
    expect(order[0]).toBe(F);
    expect(order).toMatchSnapshot();
  });

  it("hoists inside graph", () => {
    const graph = new Map();
    graph.set(A, [F, B, C]);
    graph.set(B, [D]);
    graph.set(D, [E]);
    graph.set(C, [D]);
    graph.set(F, [E]); // E must still precede F

    const order = getGraphOrder(graph, A, new Set([F]));
    expect(order[0]).toBe(E);
    expect(order[1]).toBe(F);
    expect(order).toMatchSnapshot();
  });
});