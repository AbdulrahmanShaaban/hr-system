import { transform } from '@swc/core';
import { build } from 'esbuild';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, 'src');
const distDir = join(__dirname, 'dist');

// Step 1: Compile all TS source files with SWC
function getAllTsFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllTsFiles(full));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      files.push(full);
    }
  }
  return files;
}

console.log('Compiling TypeScript with SWC...');
const tsFiles = getAllTsFiles(srcDir);
let compiled = 0;

for (const filePath of tsFiles) {
  const rel = relative(srcDir, filePath);
  const outPath = join(distDir, rel.replace(/\.ts$/, '.js'));
  mkdirSync(dirname(outPath), { recursive: true });

  const code = readFileSync(filePath, 'utf8');
  const result = await transform(code, {
    filename: filePath,
    jsc: {
      parser: { syntax: 'typescript', decorators: true },
      transform: {
        decoratorMetadata: true,
        legacyDecorator: true,
      },
    },
    module: { type: 'commonjs' },
  });
  writeFileSync(outPath, result.code);
  compiled++;
}
console.log(`✓ Compiled ${compiled} files with SWC`);

// Step 2: Bundle the dist/ directory into a single file
// (resolves all ESM @nestjs/* imports at build time)
console.log('Bundling dist/ with esbuild...');
mkdirSync(join(distDir, 'bundle'), { recursive: true });

await build({
  entryPoints: [join(distDir, 'main.js')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: join(distDir, 'bundle', 'main.js'),
  allowOverwrite: true,
  external: [
    '@prisma/client',
    '@nestjs/microservices*',
    '@nestjs/websockets*',
    'bcrypt',
    'bullmq',
    'ioredis',
    'meilisearch',
    'node:*',
  ],
  logLevel: 'info',
});
console.log('✓ Bundled dist/ → dist/bundle/main.js');

// Step 3: Bundle vercel-entry.ts → api/index.js with esbuild (NOT a plain SWC syntax
// transform). A syntax-only transform leaves `require('@nestjs/core')` untouched, and
// on Vercel that package resolves to an ESM build → ERR_REQUIRE_ESM at runtime.
// esbuild's bundler resolves that the same way it already does for dist/bundle/main.js.
console.log('Bundling vercel-entry.ts → api/index.js...');
const apiDir = join(__dirname, 'api');
mkdirSync(apiDir, { recursive: true });

await build({
  entryPoints: [join(srcDir, 'vercel-entry.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: join(apiDir, 'index.js'),
  allowOverwrite: true,
  external: [
    '@prisma/client',
    '@nestjs/microservices*',
    '@nestjs/websockets*',
    'bcrypt',
    'bullmq',
    'ioredis',
    'meilisearch',
    'node:*',
  ],
  logLevel: 'info',
});
console.log('✓ Bundled vercel-entry.ts → api/index.js');

console.log('✓ Build complete');
