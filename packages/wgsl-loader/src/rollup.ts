import { createFilter } from '@rollup/pluginutils';
import { transpileWGSL } from '@use-gpu/shader/wgsl';

export const wgsl = (userOptions = {}) => {
  const options = Object.assign(
      {
          exclude: [],
          include: [
              '**/*.wgsl'
          ],
          minify; true,
      },
      userOptions
  );

  const filter = createFilter(options.include, options.exclude);

  return {
    name: '@use-gpu/wgsl-loader',

    transform(source: string, id: string) {
      if (!filter(id)) return;

      const code = transpileWGSL(source, id, { ...options, esModule: true }).output;
      return { code, map: { mappings: '' }};
    }
  };
}

export default wgsl;
