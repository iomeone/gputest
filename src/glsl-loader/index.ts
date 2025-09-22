import { getOptions } from 'loader-utils';
import { validate } from 'schema-utils';
import { transpileGLSL } from './transpile';

const LOADER_NAME = 'GLSL Loader';

const schema = {
  type: 'object',
  properties: {
  },
} as any;

function glslLoader(this: any, source: string) {

  // Parse options
  const options = this.getOptions();
  validate(schema, options, {
    name: LOADER_NAME,
    baseDataPath: 'options'
  });

  const esModule = typeof options.esModule !== 'undefined' ? options.esModule : true;
  const {resourcePath} = this;

  return transpileGLSL(source, resourcePath, esModule);
}

export default glslLoader;