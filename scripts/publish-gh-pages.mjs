import { execFileSync } from 'node:child_process';
import { cp, mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDir, '..');
const distDir = resolve(projectRoot, 'dist');

function runGit(args, options = {}) {
  const result = execFileSync('git', args, {
    cwd: options.cwd ?? projectRoot,
    encoding: options.encoding ?? 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe']
  });

  return typeof result === 'string' ? result.trim() : result;
}

function hasLocalGhPagesBranch() {
  try {
    execFileSync('git', ['show-ref', '--verify', '--quiet', 'refs/heads/gh-pages'], {
      cwd: projectRoot,
      stdio: 'ignore'
    });
    return true;
  } catch {
    return false;
  }
}

function worktreeHasStagedChanges(cwd) {
  try {
    execFileSync('git', ['diff', '--cached', '--quiet'], {
      cwd,
      stdio: 'ignore'
    });
    return false;
  } catch (error) {
    if (error.status === 1) {
      return true;
    }

    throw error;
  }
}

function findGhPagesWorktree() {
  const output = runGit(['worktree', 'list', '--porcelain']);
  const blocks = output.split('\n\n').filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n');
    const worktreeLine = lines.find((line) => line.startsWith('worktree '));
    const branchLine = lines.find((line) => line === 'branch refs/heads/gh-pages');

    if (worktreeLine && branchLine) {
      return worktreeLine.slice('worktree '.length);
    }
  }

  return null;
}

async function clearDirectoryExceptGit(targetDir) {
  const entries = await readdir(targetDir, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.name !== '.git')
      .map((entry) =>
        rm(resolve(targetDir, entry.name), {
          recursive: true,
          force: true
        })
      )
  );
}

async function copyDistInto(targetDir) {
  const entries = await readdir(distDir, { withFileTypes: true });

  await Promise.all(
    entries.map((entry) =>
      cp(resolve(distDir, entry.name), resolve(targetDir, entry.name), {
        recursive: true,
        force: true
      })
    )
  );
}

let worktreeDir = findGhPagesWorktree();
let createdWorktree = false;

try {
  if (!worktreeDir) {
    worktreeDir = await mkdtemp(join(tmpdir(), 'doc-showcase-gh-pages-'));
    createdWorktree = true;

    if (hasLocalGhPagesBranch()) {
      runGit(['worktree', 'add', worktreeDir, 'gh-pages'], { stdio: 'inherit', encoding: 'buffer' });
    } else {
      runGit(['worktree', 'add', '-B', 'gh-pages', worktreeDir, 'origin/gh-pages'], {
        stdio: 'inherit',
        encoding: 'buffer'
      });
    }
  } else {
    const status = runGit(['status', '--short'], { cwd: worktreeDir });

    if (status) {
      throw new Error(`gh-pages worktree is dirty: ${worktreeDir}`);
    }
  }

  await clearDirectoryExceptGit(worktreeDir);
  await copyDistInto(worktreeDir);

  runGit(['add', '-A'], { cwd: worktreeDir, stdio: 'inherit', encoding: 'buffer' });

  if (!worktreeHasStagedChanges(worktreeDir)) {
    console.log('gh-pages is already up to date.');
    process.exit(0);
  }

  const shortSha = runGit(['rev-parse', '--short', 'HEAD']);
  runGit(['commit', '-m', `发布站点：${shortSha}`], {
    cwd: worktreeDir,
    stdio: 'inherit',
    encoding: 'buffer'
  });
  runGit(['push', 'origin', 'gh-pages'], {
    cwd: worktreeDir,
    stdio: 'inherit',
    encoding: 'buffer'
  });
} finally {
  if (createdWorktree && worktreeDir) {
    runGit(['worktree', 'remove', worktreeDir, '--force'], {
      stdio: 'inherit',
      encoding: 'buffer'
    });
  }
}
