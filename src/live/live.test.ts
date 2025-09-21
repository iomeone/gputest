import { LiveContext, LiveComponent, Live, DeferredCall } from './types';

import { bind, defer } from './live';

type FooProps = { foo: string };
type StringFormatter = (foo: string) => string;
type NumberReturner = () => number;

it('returns a value', () => {

  const F: Live<StringFormatter> = () => (foo: string) => {
    return `hello ${foo}`;
  };

  const result = bind(F)('wat');

  expect(result).toBe('hello wat');
})

it('returns a deferred call', () => {

  const G: Live<StringFormatter> = () => (foo: string) => {
    return `hello ${foo}`;
  };

  const F: LiveComponent<FooProps> = () => ({foo}) => {
    return defer(G)(foo);
  };

  const result = bind(F)({foo: 'wat'}) as any as DeferredCall<any>;
  expect(result).toBeTruthy();
  expect(result.f).toEqual(G);
  expect(result.args).toEqual(['wat']);
});
