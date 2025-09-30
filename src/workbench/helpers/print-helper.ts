import type { LC, LiveElement } from '../../live';

import { use, yeet, provide, useMemo, useOne, useRef } from '../../live';
import { clearBuffer, seq } from '../../core';
import { bindEntryPoint } from '../../shader/wgsl';
import { useDeviceContext } from '../providers/device-provider';
import { ShaderPrinter, PrintContext, usePrintContext, useNoPrintContext } from '../providers/print-provider';
import { getDerivedSource } from '../hooks/useDerivedSource';
import { useScratchSource } from '../hooks/useScratchSource';
import { getShader } from '../hooks/useShader';
import { useRawSource } from '../hooks/useRawSource';
import { getRenderFunc } from '../hooks/useRenderProp';
import { PassReconciler } from '../reconcilers/index';

import { LineLayer } from '../layers/line-layer';
import { PointLayer } from '../layers/point-layer';
import { Readback } from '../primitives/readback';

import { PrintData as PrintDataWGSL } from '../../wgsl/debug/printwgsl';
import printWGSL from '../../wgsl/debug/print-helperwgsl';

const {quote} = PassReconciler;

export type PrintHelperProps = {
  count?: number,
  render?: (helper: ShaderPrinter) => LiveElement,
  children?: LiveElement | ((helper: ShaderPrinter) => LiveElement),
};

const READ_WRITE_SOURCE = { readWrite: true, flags: GPUBufferUsage?.STORAGE | GPUBufferUsage?.COPY_SRC };

export const PrintHelper: LC<PrintHelperProps> = (props: PrintHelperProps) => {
  const {
    count = 1024,
    children,
  } = props;

  const atomicArray   = useOne(() => new Uint32Array(count * 4 + 4));
  const atomicStorage = useRawSource(atomicArray, 'u32', READ_WRITE_SOURCE);
  atomicStorage.format = 'T';
  atomicStorage.type = PrintDataWGSL;

  const [debugPositions, allocatePositions] = useScratchSource('vec4<f32>', READ_WRITE_SOURCE);
  const [debugColors,    allocateColors]    = useScratchSource('vec4<f32>', READ_WRITE_SOURCE);
  const [debugSegments,  allocateSegments]  = useScratchSource('i32', READ_WRITE_SOURCE);
  allocatePositions(count);
  allocateColors(count);
  allocateSegments(count);

  const device = useDeviceContext();

  const helper = useMemo(() => {
    const swap = () => {
      clearBuffer(device, debugPositions.buffer);
      clearBuffer(device, debugColors.buffer);
      clearBuffer(device, debugSegments.buffer);
      clearBuffer(device, atomicStorage.buffer);
    }

    const attributes = {
      data: getDerivedSource(atomicStorage, { readWrite: false, format: 'u32' }),
      positions: getDerivedSource(debugPositions, { readWrite: false }),
      colors: getDerivedSource(debugColors, { readWrite: false }),
      segments: getDerivedSource(debugSegments, { readWrite: false }),
    };

    const target = {
      data: atomicStorage,
      positions: debugPositions,
      colors: debugColors,
      segments: debugSegments,
    };

    const boundPrinter = getShader(printWGSL, [target.data, target.positions, target.colors, target.segments]);
    const printPoint = bindEntryPoint(boundPrinter, 'printPoint');
    const printLine = bindEntryPoint(boundPrinter, 'printLine');
    const printData = bindEntryPoint(boundPrinter, 'printData');
    const shaders = {printPoint, printLine, printData};

    return {target, attributes, shaders, swap};
  }, [device, atomicStorage, debugPositions, debugColors, debugSegments]);

  const render = getRenderFunc(props);
  return (
    render ? provide(PrintContext, helper, render(helper)) :
    children ? provide(PrintContext, helper, children) :
    yeet(helper)
  );
};

export type PrintLayerProps = {
  helper?: ShaderPrinter,

  width?: number,
  size?: number,

  zBias?: number,
  depthTest?: boolean,
};

export const PrintLayer: LC<PrintLayerProps> = (props: PrintLayerProps) => {
  const {size = 4, width = 2, depthTest = true, zBias = 1, helper} = props;
  const {attributes} = helper ? (useNoPrintContext(), helper) : usePrintContext();

  return [
    use(LineLayer, {...attributes, width, depthTest, zBias}),
    use(PointLayer, {...attributes, size, depthTest, zBias}),
  ];
};

export type PrintReadbackProps = {
  helper?: ShaderPrinter,
  limit?: number,
};

export const PrintReadback: LC<PrintReadbackProps> = (props: PrintReadbackProps) => {
  const {limit = 50, helper} = props;
  const printedRef = useRef(0);
  const {attributes} = helper ? (useNoPrintContext(), helper) : usePrintContext();

  return [
    quote(use(Readback, {
      source: attributes.data,
      then: (uint32: Uint32Array) => {
        const data = new Float32Array(uint32.buffer);
        const count = Math.min((data.length - 4) / 4, uint32[1]);

        if (count > 0) {
          if (printedRef.current < limit) {
            const slices = seq(count).map(i => data.slice(4 + i*4, 8 + i*4));
            console.log('[PrintLayer]', slices);
          }
          else if (printedRef.current == limit) {
            console.warn(`[PrintLayer] Too many logs (${limit}+). Logs stopped.`);
          }
          printedRef.current++;
        }
      },
    })),
  ];
};
