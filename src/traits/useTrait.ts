import { useOne } from '@use-gpu/live';
import { getProp } from './useProp';
import {
  ArrowFunction,
  TraitDefinition, Trait, TraitCombinator,
  InputTypes, OutputTypes, Defaulted,
  UseHooks, UseTrait,
} from './types';

const makeObject = () => ({});

const TRAIT = Symbol('trait');

// Make parsed value optional
export const optional = <A, B>(parse: (t: A) => B) => (t?: A): B | undefined => t !== undefined ? parse(t) : undefined;
export const nullable = <A, B>(parse: (t: A) => B) => (t: A | null): B | null => t != null ? parse(t) : null;

// Make derived trait from prop definition + defaults
export const trait = <
  P extends TraitDefinition,
  D extends Partial<InputTypes<P>>,
>(
  propDef: P,
  defaultValues?: D,
): Trait<Defaulted<InputTypes<P>, D>, OutputTypes<P>> => {
  // Parse default inputs to default outputs
  const defaults: Record<string, any> = {};
  if (defaultValues) for (const k in propDef) defaults[k] = (propDef as any)[k]((defaultValues as any)[k]);

  // Parse input and save to output
  return (
    input: Defaulted<InputTypes<P>, D>,
    output: OutputTypes<P>,
    {useProp}: UseHooks,
  ) => {
    for (const k in propDef) {
      const v = (input as any)[k];
      const p = useProp(v, (propDef as any)[k], defaults ? defaults[k] : undefined);
      if (p !== undefined || k in output)(output as any)[k] = p;
    }
  };
};

// Combine traits into new trait
export const combine: TraitCombinator = (
  ...traits: Trait<any, any>[]
): Trait<any, any> => {
  const ts = traits.flatMap(t => (t as any)[TRAIT] ?? t);
  const parse = (
    input: any,
    output: any,
    hooks: UseHooks,
  ) => {
    for (const parse of ts) {
      parse(input, output, hooks);
    }
  };
  parse[TRAIT] = ts;
  return parse;
}

/**
 * Make a parser for the given trait.
 */
export const makeParseTrait = <A, B>(
  t: Trait<A, B>,
): UseTrait<A, B> => (props) => parseTrait(props, t);

/**
 * Make a hook to extract props for the given trait. (Live/React polyglot)
 */
export const injectMakeUseTrait = (
  hooks: UseHooks,
) => <A, B>(
  t: Trait<A, B>,
): UseTrait<A, B> => {
  const useTrait = injectUseTrait(hooks);
  return (props) => useTrait(props, t);
};

/**
 * useTrait() implementation. (Live/React polyglot)
 *
 * Note: Always returns the same object. Unpack/clone it before memoizing.
 */
export const injectUseTrait = (
  hooks: UseHooks,
) => {
  return (<A, B>(
    props: A,
    t: Trait<A, B>,
  ): B => {
    const parsed: any = useOne(makeObject);
    t(props, parsed, hooks);
    return parsed as B;
  });
};

const apply = (f: ArrowFunction) => f();
const NO_HOOKS = {useMemo: apply, useOne: apply, useProp: getProp};

/**
 * Parse a trait from given props.
 *
 * Returns new object instance.
 */
export const parseTrait = <A, B>(
  props: A,
  t: Trait<A, B>,
): B => {
  const parsed: any = {};
  t(props, parsed, NO_HOOKS);
  return parsed as B;
};
