import type { ParsedEffect } from '../types';
import { provide, makeContext, useContext, useNoContext, useFiber, useOne, useRef } from '@use-gpu/live';

export type PresentAPI = {
  goTo: (x: number) => void,
  goForward: () => void,
  goBack: () => void,
  isThread: (id: number) => boolean,
  isVisible: (id: number) => boolean,
  getVisibleState: (id: number) => number | null,
  useTransition: (
    id: number,
    enter: ParsedEffect,
    exit: ParsedEffect,
    initial?: number,
  ) => number,
};

export type PresentContextProps = PresentAPI & {
  state: {step: number, length: number},
};

export const PresentContext = makeContext<PresentContextProps>({
  state: {step: 0, length: 0},
  goTo: () => {},
  goForward: () => {},
  goBack: () => {},
  isThread: () => true,
  isVisible: () => true,
  getVisibleState: () => 0,
  useTransition: () => 0,
} as PresentContextProps, 'PresentContext');

export const usePresentContext = () => useContext<PresentContextProps>(PresentContext);
export const useNoPresentContext = () => useNoContext(PresentContext);
