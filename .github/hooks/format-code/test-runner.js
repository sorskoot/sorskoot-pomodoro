const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function run() {
  const repoRoot = process.cwd();
  const testFileRel = '.github/hooks/_testfile.js';
  const testFile = path.resolve(repoRoot, testFileRel);

  const before = "const  x= {a:1}\n";
  await fs.writeFile(testFile, before, 'utf8');
  console.log('Wrote test file:', testFileRel);

  const hookCmd = 'node';
  const hookArgs = ['-r', 'ts-node/register', '.github/hooks/format-copilot-change.ts'];

  const child = spawn(hookCmd, hookArgs, { cwd: repoRoot, stdio: ['pipe', 'pipe', 'pipe'] });

  child.stdout.on('data', (d) => process.stdout.write(String(d)));
  child.stderr.on('data', (d) => process.stderr.write(String(d)));

  const payload = JSON.stringify({
    toolName: 'edit',
    toolArgs: { path: testFileRel },
    cwd: repoRoot,
  });

  child.stdin.write(payload);
  child.stdin.end();

  const exit = await new Promise((res) => child.on('exit', res));

  const after = await fs.readFile(testFile, 'utf8');

  console.log('\nHook exit code:', exit);
  console.log('Before file content:\n', before);
  console.log('After file content:\n', after);

  if (after !== before) {
    console.log('\nSUCCESS: file was modified (formatted) by hook.');
  } else {
    console.log('\nNO CHANGE: hook did not modify the file. Check errors above.');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
