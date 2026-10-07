import { existsSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(pkgRoot, '..', '..');
const target = join(repoRoot, 'node_modules', '@prisma', 'client');
const linkParent = join(pkgRoot, 'node_modules', '@prisma');
const linkPath = join(linkParent, 'client');

if (!existsSync(target)) {
  console.warn('@prisma/client not found at repo root; skip local link');
  process.exit(0);
}

mkdirSync(linkParent, { recursive: true });

if (existsSync(linkPath)) {
  try {
    rmSync(linkPath, { recursive: true, force: true });
  } catch {
    // Junction may need different removal on Windows; ignore if already correct.
  }
}

try {
  symlinkSync(target, linkPath, 'junction');
  console.log('Linked @prisma/client into packages/db for Prisma generate');
} catch (error) {
  console.warn('Could not link @prisma/client:', error);
}
