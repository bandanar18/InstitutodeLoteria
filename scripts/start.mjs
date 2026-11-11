// Arranque en un solo paso: instala dependencias si faltan, ofrece crear la
// cuenta de gestión la primera vez y luego inicia la web y el portal.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { createServer } from 'node:net';

const isWindows = process.platform === 'win32';

// Si otra copia del portal sigue abierta, la versión nueva no podría arrancar y
// el navegador mostraría la anterior. Se detecta antes de iniciar.
const portInUse = port => new Promise(done => {
  const server = createServer().once('error', () => done(true)).once('listening', () => server.close(() => done(false)));
  server.listen(port, '0.0.0.0');
});
const busy = [];
for (const port of [3001, 5180]) if (await portInUse(port)) busy.push(port);
if (busy.length) {
  console.error(`\n✖ Los puertos ${busy.join(' y ')} ya están en uso: probablemente hay otra copia del portal abierta.`);
  console.error('  Ciérrala (Ctrl + C en su ventana) y vuelve a ejecutar npm run iniciar.');
  if (isWindows) console.error(`  Para cerrarla desde PowerShell: Get-NetTCPConnection -LocalPort ${busy.join(',')} -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess }\n`);
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: isWindows && command === 'npm' });
  return result.status === 0;
}

if (!existsSync('node_modules/vite')) {
  console.log('\n▶ Instalando dependencias (solo la primera vez)...\n');
  if (!run('npm', ['install'])) {
    console.error('No se pudieron instalar las dependencias.');
    process.exit(1);
  }
}

function hasAdmin() {
  const file = resolve(process.env.PORTAL_DATA_DIR || 'data', 'portal.sqlite');
  if (!existsSync(file)) return false;
  return import('node:sqlite').then(({ DatabaseSync }) => {
    const db = new DatabaseSync(file, { readOnly: true });
    try {
      return Boolean(db.prepare("SELECT 1 FROM users WHERE role='admin' LIMIT 1").get());
    } catch {
      return false;
    } finally {
      db.close();
    }
  });
}

if (process.stdin.isTTY && !(await hasAdmin())) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question('\nNo hay cuenta de gestión para revisar expedientes. ¿Crearla ahora? (s/N) ')).trim().toLowerCase();
  rl.close();
  if (answer === 's' || answer === 'si' || answer === 'sí') {
    const ok = isWindows
      ? run('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'scripts/setup-admin.ps1'])
      : false;
    if (!isWindows) console.log('Crea la cuenta con: echo "<contraseña>" | npm run portal:admin -- correo@dominio');
    else if (!ok) console.log('No se creó la cuenta de gestión. Puedes intentarlo luego con: npm run portal:setup');
  }
}

console.log('\n▶ Iniciando la web y el portal. Abre http://localhost:5180 (portal: /portal). Ctrl + C para detener.\n');
await import('./dev.mjs');
