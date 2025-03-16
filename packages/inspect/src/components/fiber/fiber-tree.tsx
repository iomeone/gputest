import type { InspectState, InspectAPI } from './types'
import type { LiveFiber } from '@use-gpu/live';

import React, { FC } from 'react';
import { usePingContext } from '../../providers/ping-provider';

import { TreeWrapper, TreeWrapperWithLegend } from '../tree/tree-layout';
import { FiberLegend } from './fiber-legend';
import { FiberNode } from './fiber-node';
import { FiberTag } from './tag';

export type FiberTreeProps = FiberTreeContextProps & {
  fiber: LiveFiber<any>,

  legend: boolean,
  skipDepth: number,
  depthLimit: number,
};

// Fiber tree including legend
export const FiberTree: FC<FiberTreeProps> = ({
  state,
  api,
  fiber,
  fibers,

  legend,
  skipDepth,
}) => {
  const focusedId = state.focusedState;
  const [filterTags] = state.optionsCursor.filterTags();
  const [depthLimit] = state.optionsCursor.depth();

  const Wrap = legend ? TreeWrapperWithLegend : TreeWrapper;

  const allTags = filterTags & FiberTag.All;
  const hasOther = (allTags & FiberTag.Other) || !allTags;

  return (
    <Wrap style={{paddingTop: (focusedId || !hasOther) ? 0 : undefined}}>
      <FiberNode
        state={state}
        api={api}
        fiber={fiber}
        fibers={fibers}
        renderDepth={0}
        focusDepth={0}
        skipDepth={skipDepth}
        depthLimit={depthLimit}
      />
      {(legend ?? true) ? <FiberLegend /> : null}
    </Wrap>
  );
}
