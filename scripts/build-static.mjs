#!/usr/bin/env node
/**
 * Static build for Cloudflare Pages.
 *
 *   Build command:     node scripts/build-static.mjs
 *   Output directory:  out
 *
 * A static export cannot contain server route handlers, so the API routes and the
 * local-only /admin page are moved aside for the duration of the build and always
 * restored afterwards (even if the build fails or is interrupted).
 */
import { existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const stash = join(root, '.static-build-stash');
const serverOnly = ['api', 'admin'].map((name) => ({
  from: join(root, 'src', 'app', name),
  to: join(stash, name),
}));

let restored = false;
function restore() {
  if (restored) return;
  restored = true;
  for (const { from, to } of serverOnly) {
    if (existsSync(to) && !existsSync(from)) renameSync(to, from);
  }
  rmSync(stash, { recursive: true, force: true });
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    restore();
    process.exit(1);
  });
}

// Recover from a previously interrupted run before starting.
restore();
restored = false;

try {
  mkdirSync(stash, { recursive: true });
  for (const { from, to } of serverOnly) {
    if (existsSync(from)) renameSync(from, to);
  }
  rmSync(join(root, '.next'), { recursive: true, force: true });

  const result = spawnSync('npx', ['next', 'build'], {
    cwd: root,
    stdio: 'inherit',
    // Required on Windows, where `npx` is an .cmd shim that libuv cannot
    // resolve without a shell. Harmless on POSIX (fixed args, no user input).
    shell: process.platform === 'win32',
    env: { ...process.env, NEXT_OUTPUT: 'export' },
  });
  if (result.error) {
    console.error(result.error.message);
    restore();
    rmSync(join(root, '.next'), { recursive: true, force: true });
    process.exit(1);
  }
  restore();
  rmSync(join(root, '.next'), { recursive: true, force: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
  console.log('\n✓ Static site written to ./out — deploy that folder to Cloudflare Pages.');
} catch (error) {
  restore();
  throw error;
}
