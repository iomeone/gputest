import { LiveContext, LiveComponent, LiveFunction, DeferredCall } from './types';

import { bind, use } from './live';

type FooProps = { foo: string };
type StringFormatter = (foo: string) => string;
type NumberReturner = () => number;

it('returns a value', () => {

  const F: LiveFunction<StringFormatter> = () => (foo: string) => {
    return `hello ${foo}`;
  };

  const result = bind(F)('wat');

  expect(result).toBe('hello wat');
})

it('returns a deferred call', () => {

  const G: LiveFunction<StringFormatter> = () => (foo: string) => {
    return `hello ${foo}`;
  };

  const F: LiveComponent<FooProps> = () => ({foo}) => {
    return use(G)(foo);
  };

  const result = bind(F)({foo: 'wat'}) as any as DeferredCall<any>;
  expect(result).toBeTruthy();
  expect(result.f).toEqual(G);
  expect(result.args).toEqual(['wat']);
});
