import type { ShaderSource } from '@use-gpu/shader';
import type { StorageSource } from '@use-gpu/core';
import { makeContext, useContext, useNoContext } from '@use-gpu/live';

export type ShaderPrinter = {
  target: Record<string, StorageSource>,
  attributes: Record<string, StorageSource>,
  swap: () => void,
  shaders: {
    printPoint: ShaderSource,
    printLine: ShaderSource,
    printData: ShaderSource,
  },
};

export type PrintContextProps = ShaderPrinter;

export const PrintContext = makeContext<PrintContextProps>(undefined, 'PrintContext');
export const usePrintContext = () => useContext(PrintContext);
export const useNoPrintContext = () => useNoContext(PrintContext);
