import { LiveFiber, LiveComponent, LiveElement } from '../live/types';
import { useResource } from '../live';

import React from 'react';
import ReactDOM from 'react-dom';
import { Inspect } from './inspect';

export type UseInspectProps = {
	fiber: LiveFiber<any>,
	canvas: HTMLCanvasElement,
};

export const UseInspect: LiveComponent<UseInspectProps> = () => ({fiber, canvas}) => {
	const container = useResource((dispose) => {
		const parent = canvas.parentElement;

		const div = document.createElement('div');
		div.style.position = 'absolute';
		div.style.inset = '0';
		div.style.pointerEvents = 'none';
		parent.appendChild(div);
		
		dispose(() => parent.removeChild(div));

		return div;
	}, [canvas])

	ReactDOM.render(<Inspect fiber={fiber} />, container);
};
