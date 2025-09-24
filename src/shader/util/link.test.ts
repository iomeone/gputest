import { getGraphOrder } from './link';

describe("getGraphOrder", () => {

  it("gets graph order", () => {
    const graph = new Map();
    graph.set('a', ['b', 'c']);
    graph.set('b', ['d']);
    graph.set('d', ['e']);
    graph.set('c', ['d']);

    const order = getGraphOrder(graph, 'a');
    expect(Array.from(order.entries())).toMatchSnapshot();
  });
  
  it("detects cycles", () => {
    const graph = new Map();
    graph.set('a', ['b', 'c']);
    graph.set('b', ['d']);
    graph.set('c', ['d', 'a']);

    try {
      const order = getGraphOrder(graph, 'a');
    }
    catch (e: any) {
      expect(e.message).toMatch(/Cycle detected/);
    }
    
  });
  
});