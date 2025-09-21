import { LiveComponent } from '../live/types';
import { CanvasRenderingContextGPU } from '../webgpu/types';
import { UniformAttribute } from '../core/types';
import { CameraUniforms } from '../camera/types';

import { defer } from '../live/live';

import {
  AutoCanvas,
  Loop, Pass,
  OrbitCamera, OrbitControls,
} from '../components';
import { Cube } from './cube';

export type AppProps = {
  device: GPUDevice,
  adapter: GPUAdapter,
  canvas: HTMLCanvasElement,
  compileGLSL: (s: string, t: string) => string,
};



export const App: LiveComponent<AppProps> = () => (props) => {
  const {canvas, device, adapter, compileGLSL} = props;

  return defer(AutoCanvas)({
    canvas, device, adapter,
    render: ({
      width, height, gpuContext,
      colorStates, colorAttachments,
      depthStencilState, depthStencilAttachment,
    }: CanvasRenderingContextGPU) =>

      defer(OrbitControls)({
        canvas,
        render: (radius: number, phi: number, theta: number) =>

          defer(OrbitCamera)({
            canvas, width, height,
            radius, phi, theta,
            render: (defs: UniformAttribute[], uniforms: CameraUniforms) =>

              defer(Loop)({
                device, gpuContext, colorAttachments,
                render: () =>

                  defer(Pass)({
                    device, colorAttachments, depthStencilAttachment,
                    render: (passEncoder: GPURenderPassEncoder) => [

                      defer(Cube, 'cube')({device, colorStates, depthStencilState, compileGLSL, defs, uniforms, passEncoder}),

                    ]
                  })
              })
          })
      })
  });
};

