import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import WasmPackPlugin from '@wasm-tool/wasm-pack-plugin';
import CopyPlugin from 'copy-webpack-plugin';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  context: __dirname,
  mode: 'production',
  entry: {
		extension: {
			import: './js/index.ts',
			library: {
				type: 'commonjs2'
			}
		},
  },
  target: 'webworker',
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js']
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: resolve(__dirname, "public/bin/wapm.wasm"), to: "bin" },
        { from: resolve(__dirname, "public/bin/coreutils.wasm"), to: "bin" },
      ],
    }),
    new WasmPackPlugin({
        crateDirectory: resolve(__dirname, './'),

        // Check https://rustwasm.github.io/wasm-pack/book/commands/build.html for
        // the available set of arguments.
        //
        // Optional space delimited arguments to appear before the wasm-pack
        // command. Default arguments are `--verbose`.
        args: '--log-level warn',
        // Default arguments are `--typescript --target browser --mode normal`.
        extraArgs: '--target web',

        // Optional array of absolute paths to directories, changes to which
        // will trigger the build.
        // watchDirectories: [
        //   path.resolve(__dirname, "another-crate/src")
        // ],

        // The same as the `--out-dir` option for `wasm-pack`
        // outDir: "pkg",

        // The same as the `--out-name` option for `wasm-pack`
        // outName: "index",

        // If defined, `forceWatch` will force activate/deactivate watch mode for
        // `.rs` files.
        //
        // The default (not set) aligns watch mode for `.rs` files to Webpack's
        // watch mode.
        // forceWatch: true,

        // If defined, `forceMode` will force the compilation mode for `wasm-pack`
        //
        // Possible values are `development` and `production`.
        //
        // the mode `development` makes `wasm-pack` build in `debug` mode.
        // the mode `production` makes `wasm-pack` build in `release` mode.
        // forceMode: "development",

        // Controls plugin output verbosity, either 'info' or 'error'.
        // Defaults to 'info'.
        // pluginLogLevel: 'info'
    }),
  ],
  module: {
		rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [{
          // configure TypeScript loader:
          // * enable sources maps for end-to-end source maps
          loader: 'ts-loader'
			  }]
		  }
    ]
	},
  externals: {
		'vscode': 'commonjs vscode', // ignored because it doesn't exist
	},
  devServer: {
    compress: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    headers: {
      // This headers are needed so the SharedArrayBuffer can be properly
      // inited in the browsers
      'cross-origin-embedder-policy': 'require-corp',
      'cross-origin-opener-policy': 'same-origin',
      'access-control-allow-origin': '*'
    },
    // hot: false,
    port: 9000,
  },
  output: {
    path: resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: false
  },
  experiments: {
    topLevelAwait: true
  }
};
