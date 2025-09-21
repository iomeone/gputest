import { useCallback, useMemo, useState } from 'react';

export type Cursor<T> = [T, Updater<T>];
export type Update<T> = Partial<T>;
export type Updater<T> = (u: Update<T>) => void;

type RefineCursor1 = <T>(cursor: Cursor) => <A extends keyof T>(a: A) => Cursor<T[A]>;
type RefineCursor2 = <T>(cursor: Cursor) => <A extends keyof T, B extends keyof T[A]>(a: A, b: B) => Cursor<T[A][B]>;
type RefineCursor = RefineCursor1 | RefineCursor2;

export const refineCursor: RefineCursor = ((cursor: Cursor<any>) => (...keys: string[]) => {
	let [v, u] = cursor;
	for (const k of keys) {
		let updater = u;

		v = v[k];
		u = (update: any) => updater({ [k]: update });
	}
	return [v, u];
}) as any;

export const useRefineCursor: RefineCursor = ((cursor: Cursor<any>) => (...keys: string[]) => (
	useMemo(() => refineCursor(cursor)(keys), [cursor, ...keys])
)) as any;

export const useUpdateState = <T>(initialState: T | (() => T)): Cursor<T> => {
	const [state, setState] = useState(initialState);

	const updateState = useCallback((update: Update<T>) => {
		setState((s) => patch(s, update));
	}, []);

	// eslint-disable-next-line
	const cursor = useMemo(() => [state, updateState], [state]);

	return cursor;
}

export const patch = (a: any, b: any) => {
	if (b && b.hasOwnProperty('$set')) return b.$set;
	return merge(a, b);
}

export const merge = (a: any, b: any) => {
	if (Array.isArray(b)) return b;
	if (b == null) return b;
	if (typeof b === 'object') {
		const o = {};
		if (typeof a === 'object') {
			for (let k in a) {
				if (b.hasOwnProperty(k)) {
					const v = patch(a[k], b[k]);
					if (v !== undefined) o[k] = v;
				}
				else o[k] = a[k];
			}
			for (let k in b) {
				if (!a.hasOwnProperty(k)) o[k] = patch(undefined, b[k]);
			}
		}
		else {
			for (let k in b) {
				o[k] = patch(undefined, b[k]);
			}
		}
		return o;
	}
	return b;
}
