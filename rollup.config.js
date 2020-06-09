import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
export default [
  // browser-friendly UMD build
  {
    input: 'src/index.ts',
    output: [
      {
        name: 'AgoraPFSP',
        file: pkg.iife,
        format: 'iife',
        exports: 'named',
      },
      {
        name: 'AgoraPFSP',
        file: pkg.browser,
        format: 'umd',
        exports: 'named',
      },
    ],
    plugins: [
      resolve({ extensions }), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
      babel({
        extensions,
        babelHelpers: 'bundled',
        exclude: ['node_modules/**'],
      }),
      terser(),
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/index.ts',
    external: ['lodash', 'agora-graph'],
    plugins: [
      resolve({ extensions }), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
      babel({
        extensions,
        babelHelpers: 'runtime',
        exclude: ['node_modules/**'],
        plugins: ['@babel/plugin-transform-runtime'],
      }),
    ],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
  },
];
