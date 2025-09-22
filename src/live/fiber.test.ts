import { use } from './live';
import { makeFiber, renderFiber } from './fiber';

it("renders a fiber recursively", () => {

  const Root = () => () => use(Node)();
  const Node = () => () => {};

  const fiber = makeFiber(Root, null);

  renderFiber(fiber);

  expect(fiber.f).toBe(Root);
  expect(fiber.mount).toBeTruthy();

  if (fiber.mount) {
    const node = fiber.mount;
    expect(node && node.f).toBe(Node);
  }

});
