import type { LiveFiber } from './types';
import { makeFiberQueue } from './queue';

describe("queue", () => {

  it("orders fibers in tree order", () => {
    const makeFiber = (props: any) => props as LiveFiber<any>;

    const f1 = makeFiber({ path: [0, 0, 0], depth: 3 });
    const f2 = makeFiber({ path: [0, 0, 0], depth: 4 });
    const f3 = makeFiber({ path: [0, 0, 1], depth: 3 });
    const f4 = makeFiber({ path: [0, 0, 1], depth: 4 });
    const f5 = makeFiber({ path: [0, 0, 1], depth: 5 });

    {
      const queue = makeFiberQueue();
      queue.insert(f1);
      queue.insert(f3);
      queue.insert(f2);
      queue.insert(f5);
      queue.insert(f4);

      expect(queue.all()).toEqual([f1, f2, f3, f4, f5]);
      expect(queue.pop()).toEqual(f1);
      expect(queue.pop()).toEqual(f2);
      expect(queue.pop()).toEqual(f3);
      expect(queue.pop()).toEqual(f4);
      expect(queue.pop()).toEqual(f5);
      expect(queue.pop()).toEqual(null);
    }

    {
      const queue = makeFiberQueue();
      queue.insert(f3);
      queue.insert(f5);
      queue.insert(f4);
      queue.insert(f2);
      queue.insert(f1);

      expect(queue.all()).toEqual([f1, f2, f3, f4, f5]);
      expect(queue.pop()).toEqual(f1);
      expect(queue.pop()).toEqual(f2);
      expect(queue.pop()).toEqual(f3);
      expect(queue.pop()).toEqual(f4);
      expect(queue.pop()).toEqual(f5);
      expect(queue.pop()).toEqual(null);
    }

    {
      const queue = makeFiberQueue();
      queue.insert(f3);
      queue.insert(f5);
      queue.insert(f4);

      queue.remove(f5);
      expect(queue.all()).toEqual([f3, f4]);

      queue.remove(f3);
      expect(queue.all()).toEqual([f4]);

      queue.remove(f4);
      expect(queue.all()).toEqual([]);

      queue.insert(f2);
      queue.insert(f1);
      expect(queue.all()).toEqual([f1, f2]);
      queue.remove(f2);
      queue.insert(f3);
      expect(queue.all()).toEqual([f1, f3]);
    }
  });

});
