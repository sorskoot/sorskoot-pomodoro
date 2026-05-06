const { spawn } = require('child_process');
const path = require('path');

const cwd = 'c:\\dev\\Pomodoro';

async function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: 'pipe',
      shell: true
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  console.log('='.repeat(80));
  console.log('STEP 1: Running npm install');
  console.log('='.repeat(80));
  let result = await runCommand('npm', ['install']);
  console.log('STDOUT:', result.stdout.slice(-1000));
  if (result.stderr) console.log('STDERR:', result.stderr.slice(-500));
  console.log('RC:', result.code, '\n');

  console.log('='.repeat(80));
  console.log('STEP 2: Running npm run build');
  console.log('='.repeat(80));
  result = await runCommand('npm', ['run', 'build']);
  console.log('STDOUT (last 3000 chars):', result.stdout.slice(-3000));
  if (result.stderr) console.log('STDERR (last 2000 chars):', result.stderr.slice(-2000));
  console.log('RC:', result.code, '\n');

  console.log('='.repeat(80));
  console.log('STEP 3: Running npm test');
  console.log('='.repeat(80));
  result = await runCommand('npm', ['test']);
  console.log('STDOUT (last 3000 chars):', result.stdout.slice(-3000));
  if (result.stderr) console.log('STDERR (last 2000 chars):', result.stderr.slice(-2000));
  console.log('RC:', result.code);
}

main().catch(console.error);
