// Inicia el API del portal y el servidor web (Vite) juntos.
// Si alguno se detiene de forma inesperada, se reinicia automáticamente
// (hasta 5 veces por minuto) en lugar de tumbar todo el sistema.
import { spawn } from 'node:child_process';

const services = [
  { name: 'API del portal', args: ['server/index.mjs'] },
  { name: 'Servidor web', args: ['node_modules/vite/bin/vite.js', '--host', '0.0.0.0', '--port', '5180', '--strictPort', ...process.argv.slice(2)] },
];
let stopping = false;

function launch(service) {
  const child = spawn(process.execPath, service.args, { stdio: 'inherit' });
  service.child = child;
  child.on('error', error => console.error(`[${service.name}] ${error.message}`));
  child.on('exit', code => {
    if (stopping) return;
    const now = Date.now();
    service.restarts = (service.restarts || []).filter(t => now - t < 60000);
    if (service.restarts.length >= 5) {
      console.error(`\n✖ ${service.name} se detuvo varias veces seguidas (código ${code}). Revisa el error de arriba y vuelve a ejecutar npm run iniciar.`);
      stop(1);
      return;
    }
    service.restarts.push(now);
    console.warn(`\n⚠ ${service.name} se detuvo (código ${code}). Reiniciando en 2 segundos...`);
    setTimeout(() => !stopping && launch(service), 2000);
  });
}

function stop(code = 0) {
  stopping = true;
  for (const service of services) service.child?.kill();
  process.exitCode = code;
}

services.forEach(launch);
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
