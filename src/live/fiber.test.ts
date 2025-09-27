import type { Component, DeferredCall } from './types';
import { use } from './builtin';
import { bind, makeFiber, renderFiber, updateFiber } from './fiber';

type FooProps = { foo: string };
type StringFormatter = (foo: string) => string;
type NumberReturner = () => number;

it('returns a value', () => {

  const F: StringFormatter = (foo: string) => {
    return `hello ${foo}`;
  };

  const result = bind(F)('wat');

  expect(result).toBe('hello wat');
})

it('returns a deferred call', () => {

  const G: StringFormatter = (foo: string) => {
    return `hello ${foo}`;
  };

  const F: Component<FooProps> = ({foo}) => {
    return use(G, foo);
  };

  const result = bind(F)({foo: 'wat'}) as any as DeferredCall<any>;
  expect(result).toBeTruthy();
  expect(result.f).toEqual(G);
  expect(result.args).toEqual(['wat']);
});


it("renders a fiber recursively", () => {

  const Root = () => use(Node);
  const Node = () => {};

  const fiber = makeFiber(Root, null);

  const element = renderFiber(fiber);
  updateFiber(fiber, element);

  expect(fiber.f).toBe(Root);
  expect(fiber.mount).toBeTruthy();

  if (fiber.mount) {
    const node = fiber.mount;
    expect(node && node.f).toBe(Node);
  }

});
