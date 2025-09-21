import { LiveFiber } from '../live/types';
import { useResource, formatValue } from '../live';
import { useUpdateState } from './cursor';
import { ExpandState, SelectState, PingState } from './types';

import React, { useEffect, useState } from 'react';
import { Node } from './node';
import { Fiber } from './fiber';
import { Props } from './props';
import { InspectContainer, SplitRow, RowPanel, Scrollable, Inset } from './layout';
import { Grid } from 'semantic-ui-react'

const { Row, Column } = Grid;

type InspectProps = {
	fiber: LiveFiber<any>,
}

export const Inspect: React.FC<InspectProps> = ({fiber}) => {
	const expandCursor = useUpdateState<ExpandState>({});
	const selectedCursor = useUpdateState<SelectState>(null);

	const [selectedFiber] = selectedCursor;
	const ping = usePingTracker(fiber);

	return (
		<InspectContainer>
			<SplitRow>
				<RowPanel style={{width: '33%'}}>
					<Scrollable>
						<Inset>
							<Fiber fiber={fiber} ping={ping} expandCursor={expandCursor} selectedCursor={selectedCursor} />
						</Inset>
					</Scrollable>
				</RowPanel>
				<RowPanel style={{width: '67%'}}>
					<Scrollable>
						<Inset>
							{selectedFiber ? <Props fiber={selectedFiber} /> : null}
						</Inset>
					</Scrollable>
				</RowPanel>
			</SplitRow>
		</InspectContainer>
	);
}

const usePingTracker = (fiber: LiveFiber<any>) => {
	const [ping, setPing] = useState<PingState>({});

	const [ref] = useState({ ping });
	ref.ping = ping;

	useEffect(() => {
		let uTimer = null;
		let rTimer = null;

		let update = {};
		let reset = {};

		const flush = () => {
			const u = update;
			uTimer = null;
			update = {};
			setPing((s) => ({...s, ...u}));

			for (let k in u) reset[k] = 0;
			if (!rTimer) rTimer = setTimeout(() => {
				const r = reset;
				rTimer = null;
				reset = {};
				setPing((s) => ({...s, ...r}))
			}, 500);
		}

		fiber.host.__ping = (fiber: LiveFiber<any>) => {
			reset[fiber.id] = update[fiber.id] = ((ref.ping[fiber.id] || 0) % 256) + 1;			
			if (!uTimer) uTimer = setTimeout(flush, 0);
		};
		return () => {
			fiber.host.__ping = () => {};
		};
	}, [ref]);

	return ping;
}
