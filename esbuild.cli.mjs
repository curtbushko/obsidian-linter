import esbuild from 'esbuild';
import {existsSync, mkdirSync, chmodSync} from 'fs';
import importGlobPlugin from 'esbuild-plugin-import-glob';
import {replace} from 'esbuild-plugin-replace';
import builtins from 'builtin-modules';

const isProduction = process.argv.includes('production');

// Ensure dist directory exists
if (!existsSync('dist')) {
  mkdirSync('dist');
}

// Build configuration for CLI
const buildConfig = {
  entryPoints: ['src/cli.ts'],
  bundle: true,
  platform: 'node',
  target: 'es2020',
  outfile: 'dist/obsidian-linter-cli.js',
  external: [
    '@codemirror/*',
    ...builtins,
  ],
  alias: {
    // Map obsidian imports to our stub
    'obsidian': './src/obsidian-stub.ts',
  },
  plugins: [
    importGlobPlugin.default(),
  ],
  format: 'cjs',
  sourcemap: !isProduction,
  minify: isProduction,
  define: {
    'process.env.NODE_ENV': isProduction ? '"production"' : '"development"',
  },
};

async function build() {
  try {
    console.log('Building CLI...');

    await esbuild.build(buildConfig);

    // Make the output file executable
    chmodSync('dist/obsidian-linter-cli.js', 0o755);

    console.log('✓ CLI built successfully');
    console.log('  Output: dist/obsidian-linter-cli.js');

    if (!isProduction) {
      console.log('  Source maps: enabled');
      console.log('  Watching for changes...');

      const ctx = await esbuild.context(buildConfig);
      await ctx.watch();
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
