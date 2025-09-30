export type ArrowFunction = (...args: any[]) => any;

export type Props = Record<string, any>;
export type Parser<A, B> = (t: A) => B;

export type TraitDefinition = Record<string, Parser<any, any>>;

export type Trait<A, B> = (input: A, output: B, hooks: UseHooks) => void;
export type UseTrait<I, O> = (props: I) => O;

export type TraitProps<T> = T extends Trait<infer A, any> ? A : never;

export type TraitCombinator = {
  <A, B, C, D>(a: Trait<A, B>, b: Trait<C, D>): Trait<A & C, B & D>;
  <A, B, C, D, E, F>(a: Trait<A, B>, b: Trait<C, D>, c: Trait<E, F>): Trait<A & C & E, B & D & F>;
  <A, B, C, D, E, F, G, H>(a: Trait<A, B>, b: Trait<C, D>, c: Trait<E, F>, d: Trait<G, H>): Trait<A & C & E & G, B & D & F & H>;
  <A, B, C, D, E, F, G, H, I, J>(a: Trait<A, B>, b: Trait<C, D>, c: Trait<E, F>, d: Trait<G, H>, e: Trait<I, J>): Trait<A & C & E & G & I, B & D & F & H & J>;
  <A, B, C, D, E, F, G, H, I, J, K, L>(a: Trait<A, B>, b: Trait<C, D>, c: Trait<E, F>, d: Trait<G, H>, e: Trait<I, J>, f: Trait<K, L>): Trait<A & C & E & G & I & K, B & D & F & H & J & L>;
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N>(a: Trait<A, B>, b: Trait<C, D>, c: Trait<E, F>, d: Trait<G, H>, e: Trait<I, J>, f: Trait<K, L>, g: Trait<M, N>): Trait<A & C & E & G & I & K & M, B & D & F & H & J & L & N>;
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>(a: Trait<A, B>, b: Trait<C, D>, c: Trait<E, F>, d: Trait<G, H>, e: Trait<I, J>, f: Trait<K, L>, g: Trait<M, N>, h: Trait<O, P>): Trait<A & C & E & G & I & K & M & O, B & D & F & H & J & L & N & P>;
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R>(a: Trait<A, B>, b: Trait<C, D>, c: Trait<E, F>, d: Trait<G, H>, e: Trait<I, J>, f: Trait<K, L>, g: Trait<M, N>, h: Trait<O, P>, i: Trait<Q, R>): Trait<A & C & E & G & I & K & M & O & Q, B & D & F & H & J & L & N & P & R>;
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T>(a: Trait<A, B>, b: Trait<C, D>, c: Trait<E, F>, d: Trait<G, H>, e: Trait<I, J>, f: Trait<K, L>, g: Trait<M, N>, h: Trait<O, P>, i: Trait<Q, R>, j: Trait<S, T>): Trait<A & C & E & G & I & K & M & O & Q & S, B & D & F & H & J & L & N & P & R & T>;
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V>(a: Trait<A, B>, b: Trait<C, D>, c: Trait<E, F>, d: Trait<G, H>, e: Trait<I, J>, f: Trait<K, L>, g: Trait<M, N>, h: Trait<O, P>, i: Trait<Q, R>, j: Trait<S, T>, k: Trait<U, V>): Trait<A & C & E & G & I & K & M & O & Q & S & U, B & D & F & H & J & L & N & P & R & T & V>;
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X>(a: Trait<A, B>, b: Trait<C, D>, c: Trait<E, F>, d: Trait<G, H>, e: Trait<I, J>, f: Trait<K, L>, g: Trait<M, N>, h: Trait<O, P>, i: Trait<Q, R>, j: Trait<S, T>, k: Trait<U, V>, l: Trait<W, X>): Trait<A & C & E & G & I & K & M & O & Q & S & U & W, B & D & F & H & J & L & N & P & R & T & V & X>;
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z>(a: Trait<A, B>, b: Trait<C, D>, c: Trait<E, F>, d: Trait<G, H>, e: Trait<I, J>, f: Trait<K, L>, g: Trait<M, N>, h: Trait<O, P>, i: Trait<Q, R>, j: Trait<S, T>, k: Trait<U, V>, l: Trait<W, X>, m: Trait<Y, Z>): Trait<A & C & E & G & I & K & M & O & Q & S & U & W & Y, B & D & F & H & J & L & N & P & R & T & V & X & Z>;
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, _A, _B>(a: Trait<A, B>, b: Trait<C, D>, c: Trait<E, F>, d: Trait<G, H>, e: Trait<I, J>, f: Trait<K, L>, g: Trait<M, N>, h: Trait<O, P>, i: Trait<Q, R>, j: Trait<S, T>, k: Trait<U, V>, l: Trait<W, X>, m: Trait<Y, Z>, n: Trait<_A, _B>): Trait<A & C & E & G & I & K & M & O & Q & S & U & W & Y & _A, B & D & F & H & J & L & N & P & R & T & V & X & Z & _B>;
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, _A, _B, _C, _D>(a: Trait<A, B>, b: Trait<C, D>, c: Trait<E, F>, d: Trait<G, H>, e: Trait<I, J>, f: Trait<K, L>, g: Trait<M, N>, h: Trait<O, P>, i: Trait<Q, R>, j: Trait<S, T>, k: Trait<U, V>, l: Trait<W, X>, m: Trait<Y, Z>, n: Trait<_A, _B>, o: Trait<_C, _D>): Trait<A & C & E & G & I & K & M & O & Q & S & U & W & Y & _A & _C, B & D & F & H & J & L & N & P & R & T & V & X & Z & _B & _D>;
  <A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, _A, _B, _C, _D, _E, _F>(a: Trait<A, B>, b: Trait<C, D>, c: Trait<E, F>, d: Trait<G, H>, e: Trait<I, J>, f: Trait<K, L>, g: Trait<M, N>, h: Trait<O, P>, i: Trait<Q, R>, j: Trait<S, T>, k: Trait<U, V>, l: Trait<W, X>, m: Trait<Y, Z>, n: Trait<_A, _B>, o: Trait<_C, _D>, p: Trait<_E, _F>): Trait<A & C & E & G & I & K & M & O & Q & S & U & W & Y & _A & _C & _E, B & D & F & H & J & L & N & P & R & T & V & X & Z & _B & _D & _F>;
};

type IfUndefined<A, B> = undefined extends A ? B : never;
type IfDefined<A, B> = undefined extends A ? never : B;
type IsKeyOf<K, D, T> = K extends keyof D ? T : never;
type IsNotKeyOf<K, D, T> = K extends keyof D ? never : T;

export type InputTypes<T extends TraitDefinition> = {
  [P in keyof T as IfUndefined<Parameters<T[P]>[0], P>]?: Parameters<T[P]>[0];
} & {
  [P in keyof T as IfDefined<Parameters<T[P]>[0], P>]: Parameters<T[P]>[0];
};

export type OutputTypes<T extends TraitDefinition> = {
  [P in keyof T]: ReturnType<T[P]>;
};

export type Defaulted<T extends TraitDefinition, D extends Record<string, any>> = {
  [P in keyof T as (IsKeyOf<P, D, P> | IfUndefined<T[P], P>)]?: T[P];
} & {
  [P in keyof T as (IsNotKeyOf<P, D, IfDefined<T[P], P>>)]: T[P];
};

/*
// Generate TraitCombinator
{
const seq = (n) => Array.from({length: n}).map((_, i) => i);

const letters = [
  ...seq(26).map(i => String.fromCharCode(65 + i)),
  ...seq(6).map(i => '_' + String.fromCharCode(65 + i)),
];
const upper = i => letters[i];
const lower = i => letters[i].toLowerCase();

const chunks = [];
for (let i = 2; i <= 16; ++i) {

    const typeArgs = seq(i * 2).map(i => `${upper(i)}`).join(", ");
    const funcArgs = seq(i).map(i => `${lower(i)}: Trait<${upper(i*2)}, ${upper(i*2+1)}>`).join(", ");

    const combine1 = seq(i).map(i => upper(i * 2)).join(' & ');
    const combine2 = seq(i).map(i => upper(i * 2 + 1)).join(' & ');

    const rType = `Trait<${combine1}, ${combine2}>`;

    chunks.push(`<${typeArgs}>(${funcArgs}): ${rType};`);
}

console.log(chunks.join("\n"));
}
*/

// React/Live Interop

export type UseMemo = <T>(memoValue: () => T, deps: any[]) => T;
export type UseOne = <T>(memoValue: () => T, deps?: any) => T;
export type UseProp = {
    <A, B>(value: A | undefined, parse: (t: A) => B, def: B): B;
    <A, B>(value: A | undefined, parse: (t?: A) => B): B;
    <A, B>(value: A, parse: (t: A) => B): B;
};

export type UseHooks = {useMemo: UseMemo, useOne: UseOne, useProp: UseProp};

export type MemoCompare = <T>(oldProps: T, newProps: T) => boolean;
