import type { Options } from 'tsup'

import pkg from './package.json'

const external = [
  ...Object.keys(pkg.dependencies || {}),
]

export default <Options>{
  entryPoints: ['src/index.ts'],
  outDir: 'dist',
  target: 'esnext',
  format: ['esm'],
  sourcemap: true,
  clean: true,
  dts: true,
  minify: true,
  external,
}
