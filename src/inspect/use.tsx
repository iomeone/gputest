import { LiveFiber, LiveComponent, LiveElement } from '@use-gpu/live/types';
import { useOne, useResource } from '@use-gpu/live';

import React from 'react';
import ReactDOM from 'react-dom';
import { Inspect } from './components/inspect';

export type UseInspectProps = {
	fiber: LiveFiber<any>,
	canvas: HTMLCanvasElement,
};

export const UseInspect: LiveComponent<UseInspectProps> = () => ({fiber, canvas}) => {
	const container = useResource((dispose) => {
		const parent = canvas.parentElement;

		const div = document.createElement('div');
		div.style.position = 'absolute';
		(div.style as any).inset = '0';
		div.style.pointerEvents = 'none';
		if (parent) parent.appendChild(div);
		
		dispose(() => {
			ReactDOM.unmountComponentAtNode(container);
			if (parent) parent.removeChild(div);
		});

		return div;
	}, [canvas]);

	ReactDOM.render(<Inspect fiber={fiber} />, container);

	return null;
};
