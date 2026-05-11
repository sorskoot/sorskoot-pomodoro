import { spawn } from 'child_process';
import { stat } from 'fs/promises';
import path from 'path';

type Payload = {
  toolName?: string;
  toolArgs?: any;
  cwd?: string;
};

async function readStdIn(): Promise<string> {
  let data = '';
  for await (const chunk of process.stdin) {
    data += chunk;
  }
  return data;
}

function normalizeToolArgs(toolArgs: any): any {
  if (!toolArgs) return {};
  if (typeof toolArgs === 'string') {
    try {
      return JSON.parse(toolArgs);
    } catch {
      return {};
    }
  }
  return toolArgs;
}

function getTargetPath(toolArgs: any): string | undefined {
  const candidates = [toolArgs.path, toolArgs.filePath, toolArgs.file_path, toolArgs.target_file];
  return candidates.find((v) => typeof v === 'string' && v.trim().length > 0);
}

async function runPrettier(filePath: string, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const prettierCli = path.resolve(cwd, 'node_modules', 'prettier', 'bin', 'prettier.cjs');
    const child = spawn(process.execPath, [prettierCli, '--write', '--ignore-unknown', '--log-level', 'warn', filePath], {
      cwd,
      stdio: 'inherit',
    });

    child.on('error', (err) => reject(err));
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Prettier exited with code ${code ?? 'unknown'}`));
    });
  });
}

async function main() {
  const input = await readStdIn();
  if (!input.trim()) return;

  let payload: Payload;
  try {
    payload = JSON.parse(input);
  } catch {
    return;
  }

  if (!payload || !payload.toolName) return;
  if (!['edit', 'create'].includes(payload.toolName)) return;

  const toolArgs = normalizeToolArgs(payload.toolArgs);
  const filePath = getTargetPath(toolArgs);
  if (!filePath) return;

  const repoRoot = payload.cwd && typeof payload.cwd === 'string' ? payload.cwd : process.cwd();
  const resolvedPath = path.isAbsolute(filePath) ? filePath : path.resolve(repoRoot, filePath);

  try {
    const s = await stat(resolvedPath);
    if (!s.isFile()) return;
  } catch {
    return;
  }

  try {
    await runPrettier(resolvedPath, repoRoot);
  } catch (err) {
    // swallow errors; hooks should not break the session
    // but surface to stderr for debugging
    // eslint-disable-next-line no-console
    console.error('Prettier failed:', err instanceof Error ? err.message : String(err));
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e instanceof Error ? e.message : String(e));
});
