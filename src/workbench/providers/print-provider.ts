import type { ShaderSource } from '../../shader';
import type { StorageSource } from '../../core';
import { makeContext, useContext, useNoContext } from '../../live';

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
