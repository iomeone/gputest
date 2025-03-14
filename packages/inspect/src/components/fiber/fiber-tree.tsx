import type { InspectState, InspectAPI } from './types'
import type { LiveFiber } from '@use-gpu/live';

import React, { FC } from 'react';
import { usePingContext } from '../../providers/ping-provider';

import { TreeWrapper, TreeWrapperWithLegend } from '../tree/tree-layout';
import { FiberLegend } from './fiber-legend';
import { FiberNode } from './fiber-node';
import { FiberTag } from './tag';

export type FiberTreeProps = {
  state: InspectState,
  api: InspectAPI,
  fiber: LiveFiber<any>,
  skipDepth: number,
  filterTags: number,
  depthLimit: number,
  runCounts: boolean,
  builtins: boolean,
  highlight: boolean,
  legend: boolean,
};

// Fiber tree including legend
export const FiberTree: FC<FiberTreeProps> = ({
  state,
  api,
  fiber,
  skipDepth,
  filterTags,
  depthLimit,
  runCounts,
  builtins,
  highlight,
  legend,
}) => {
  const {fibers} = usePingContext();
  const by = fibers.get(fiber.by);
  const [focusedId] = state.focusedCursor();

  const Wrap = legend ? TreeWrapperWithLegend : TreeWrapper;

  return (
    <Wrap style={{paddingTop: (focusedId || (filterTags && (filterTags & FiberTag.All) !== FiberTag.All)) ? 0 : undefined}}>
      <FiberNode
        state={state}
        api={api}
        by={by}
        fiber={fiber}
        fibers={fibers}
        renderDepth={0}
        skipDepth={skipDepth}
        focusDepth={0}
        filterTags={filterTags}
        depthLimit={depthLimit}
        runCounts={runCounts}
        builtins={builtins}
        highlight={highlight}
      />
      {(legend ?? true) ? <FiberLegend /> : null}
    </Wrap>
  );
}
