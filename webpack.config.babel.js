import path from 'path';

const {NODE_ENV} = process.env;
const isDevelopment = NODE_ENV === 'development';

export default {
  entry: './src/index',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'use.bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },

  experiments: {
    asyncWebAssembly: true,   
    // syncWebAssembly: true,
  },
    
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: [/node_modules/],
        loader: 'babel-loader',
      },
      {
        test: /\.glsl$/i,
        use: 'raw-loader',
      },
      
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },

      // A. 你的 Rust 包（用 new URL 加载的 wasm）→ 当成静态资源 URL
      {
        test: /src[\/\\]use-gpu-text[\/\\]pkg[\/\\].*\.wasm$/,
        type: 'asset/resource',
      },

      {
        test: /src[\/\\]mikktspace[\/\\]pkg[\/\\].*\.wasm$/,
        type: 'asset/resource',
      },

      // B. 其余第三方 wasm（如 mikktspace）→ 真·webassembly/async
      // {
      //   test: /\.wasm$/,
      //   type: 'webassembly/async',
      //   exclude: /src[\/\\]use-gpu-text[\/\\]pkg[\/\\].*\.wasm$/,
      // },

    ],
  },
  devtool: isDevelopment ? 'eval-source-map' : false,
  devServer: {
    publicPath: '/dist/',
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 8777,
  }
};