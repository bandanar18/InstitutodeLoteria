import './agencias.css';

// Direcciones de FortunaBet (operadora de las agencias online).
// Se configuran en .env: VITE_FORTUNABET_URL (web de la Lotería FortunaBet)
// y VITE_FORTUNABET_WALLET_URL (Wallet de Agencias Virtuales).
const clean = url => String(url || '').replace(/\/$/, '');
const FORTUNABET_URL = clean(import.meta.env.VITE_FORTUNABET_URL) || 'http://localhost:5173';
const WALLET_URL = clean(import.meta.env.VITE_FORTUNABET_WALLET_URL) || 'http://localhost:5174';
const REGISTER_URL = `${WALLET_URL}/registro`; // registro de AGENCIA ONLINE en la Wallet
const external = 'target="_blank" rel="noopener"';

const paths = {
  external: '<path d="M14 4h6v6m0-6L10 14M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  wallet: '<path d="M4 7a2 2 0 0 1 2-2h12v4"/><path d="M4 7v11a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2Z"/><path d="M16 14.5h.01"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9m-4 4 3 3"/>',
  badge: '<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
  coins: '<circle cx="9" cy="9" r="6"/><path d="M15.5 4.5a6 6 0 0 1 0 15M9 6v6l2 1"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  building: '<path d="m3 9 9-6 9 6H3Zm2 3v7m5-7v7m4-7v7m5-7v7M3 21h18"/>',
};
const icon = (name, size = 22) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
const ext = icon('external', 16);

const steps = [
  ['badge', 'Abre el registro de agencia', 'Desde aquí vas directo al formulario de agencia online de la Wallet de FortunaBet. No es el registro de jugador.'],
  ['user', 'Tus datos', 'Nombre, cédula, fecha de nacimiento, teléfono venezolano y correo. Tu agencia aparece con tu nombre.'],
  ['key', 'Crea tu acceso', 'Elige tu correo y contraseña y acepta los Términos del Programa de Agencias.'],
  ['qr', 'Recibe tu código y QR', 'Tu agencia queda activa al instante con un código de afiliado único para compartir.'],
  ['coins', 'Cobra tus comisiones', 'Ganas un porcentaje de cada jugada de tus referidos y lo ves en tu wallet al instante.'],
];

const features = [
  ['coins', 'Comisión por cada jugada', 'Ganas el 3 % de cada jugada que hagan las personas que se registren con tu código, en todos los juegos.'],
  ['bolt', 'Comisiones en tiempo real', 'Tu wallet muestra lo disponible y lo que está por liberar en el momento en que se juega.'],
  ['users', 'Referidos para siempre', 'Quien se registra con tu código queda vinculado a tu agencia de forma permanente.'],
  ['phone', 'Retiros por Pago Móvil', 'Pasa tus comisiones a tu saldo de juego cuando quieras o retíralas en bolívares a tu Pago Móvil.'],
];

const requirements = [
  'Ser mayor de 18 años.',
  'Cédula venezolana (V o E) o pasaporte vigente.',
  'Número de teléfono venezolano y correo electrónico propios.',
  'Cuenta de FortunaBet activa y sin autoexclusión vigente.',
  'Aceptar los Términos del Programa de Agencias.',
  'Una persona = una agencia.',
];

const withdrawals = [
  'Verificación de identidad (KYC nivel 2) aprobada en FortunaBet.',
  'Una cuenta de Pago Móvil registrada en tu directorio, confirmada con un código SMS.',
  'Los retiros se pagan siempre en bolívares; si retiras desde USDT se usa la tasa BCV del día.',
];

const faqs = [
  ['¿Quién administra el registro de las agencias online?', 'FortunaBet, operadora de las agencias online. El registro de usuarios, la activación de cada agencia, las comisiones y los retiros se gestionan en sus plataformas. La Lotería de Mérida regula la actividad.'],
  ['¿En qué se diferencia del registro de jugador?', 'El registro de agencia online crea tu cuenta y, en el mismo paso, activa tu agencia con su código y QR para invitar jugadores y cobrar comisiones. El registro de jugador solo sirve para jugar.'],
  ['¿Y si ya tengo cuenta en FortunaBet?', 'Pulsa «Ya soy agencia · Entrar», inicia sesión con tu mismo correo y contraseña y activa tu agencia con un toque.'],
  ['¿Cuánto cuesta afiliarme?', 'Activar tu agencia no requiere inversión. Solo necesitas tu cuenta de FortunaBet y aceptar los términos del programa.'],
  ['¿Cómo se vinculan mis referidos?', 'Cuando alguien abre tu enlace o escanea tu QR, FortunaBet guarda tu código y lo muestra en su registro («Te invitó: tu agencia»). El vínculo se crea solo al registrarse y es permanente.'],
  ['¿Qué jugadas no generan comisión?', 'Las simulaciones, las jugadas de personas que aún no tienen un depósito aprobado y las jugadas hechas mientras la agencia esté suspendida.'],
  ['¿Cuándo puedo retirar mis comisiones?', 'Puedes pasarlas a tu saldo de juego desde el primer día. Para retirarlas al banco necesitas la verificación de identidad nivel 2 y una cuenta de Pago Móvil registrada.'],
  ['¿Puede suspenderse una agencia?', 'Sí. El equipo de FortunaBet puede suspender una agencia que incumpla los términos; mientras esté suspendida no genera comisiones nuevas ni puede retirar, pero conserva su historial.'],
];

export function agenciasMarkup() {
  return `<main id="main" class="ag">
  <section class="ag-hero">
    <div class="ag-container ag-hero-grid">
      <div class="ag-hero-copy">
        <a class="ag-crumb" href="/">Inicio</a><span class="ag-crumb-sep">/</span><a class="ag-crumb" href="/loteria">Lotería</a>
        <span class="ag-eyebrow">AGENCIAS ONLINE · AFILIACIÓN CON FORTUNABET</span>
        <h1>Conviértete en agencia virtual con tu <em>wallet</em> FortunaBet</h1>
        <p>La afiliación de agencias online de la Lotería de Mérida se realiza con <strong>FortunaBet</strong>, la operadora encargada del registro, la activación y la administración de cada agencia. Regístrate, activa tu wallet y empieza a ganar comisiones.</p>
        <div class="ag-actions"><a class="ag-btn green" href="${REGISTER_URL}" ${external} data-fortuna="registro">Registrar mi agencia online ${ext}</a><a class="ag-btn ghost" href="${WALLET_URL}" ${external} data-fortuna="wallet">Ya soy agencia · Entrar ${ext}</a></div>
        <p class="ag-hero-hint">${icon('shield', 16)} El registro se completa en la Wallet de Agencias de FortunaBet.</p>
        <ul class="ag-facts"><li><strong>3 %</strong><span>de cada jugada</span></li><li><strong>0</strong><span>inversión</span></li><li><strong>1</strong><span>sola cuenta</span></li></ul>
      </div>
      <div class="ag-hero-visual">
        <img src="/assets/online.png" alt="Agencia online en computadora y teléfono" width="450" height="480">
        <div class="ag-wallet-card" aria-hidden="true">
          <div class="ag-wallet-top">${icon('wallet', 20)}<span>Wallet de Agencias</span><em>Activa</em></div>
          <div class="ag-wallet-balance"><small>Disponible</small><strong>Bs. 12.480,00</strong><span>+ Bs. 3.120,00 por liberar</span></div>
          <ul><li class="ok">${icon('check', 14)} Código y QR de afiliado</li><li class="ok">${icon('check', 14)} 3 % por jugada de referidos</li><li class="ok">${icon('check', 14)} Retiro por Pago Móvil</li></ul>
          <small class="ag-wallet-demo">Ejemplo ilustrativo</small>
        </div>
      </div>
    </div>
  </section>

  <section class="ag-band">
    <div class="ag-container ag-band-inner">
      <span class="ag-icon light">${icon('building')}</span>
      <p><strong>¿Quién hace qué?</strong> FortunaBet registra a los usuarios, activa las agencias y administra comisiones y retiros. La Lotería de Mérida regula la actividad y vela por el juego responsable.</p>
    </div>
  </section>

  <section class="ag-section ag-soft" id="proceso">
    <div class="ag-container">
      <div class="ag-heading"><span class="ag-eyebrow dark">ASÍ TE AFILIAS</span><h2>Cinco pasos y tu agencia está lista<span>.</span></h2><p>Un solo formulario crea tu cuenta y activa tu agencia en la Wallet de FortunaBet.</p></div>
      <ol class="ag-steps">${steps.map(([ico, title, text], i) => `<li><span class="ag-step-num">${i + 1}</span><span class="ag-icon">${icon(ico)}</span><h3>${title}</h3><p>${text}</p></li>`).join('')}</ol>
      <div class="ag-step-actions"><a class="ag-btn green" href="${REGISTER_URL}" ${external}>Ir al registro de agencia online ${ext}</a></div>
    </div>
  </section>

  <section class="ag-section" id="beneficios">
    <div class="ag-container">
      <div class="ag-heading"><span class="ag-eyebrow dark">TU WALLET DE AGENCIA</span><h2>Todo lo de tu agencia en un solo lugar<span>.</span></h2><p>Una aplicación que se instala en tu teléfono, conectada en tiempo real con FortunaBet.</p></div>
      <div class="ag-approve four">${features.map(([ico, title, text]) => `<article><span class="ag-icon">${icon(ico)}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div>
    </div>
  </section>

  <section class="ag-section ag-dark" id="requisitos">
    <div class="ag-container ag-rules">
      <div><span class="ag-eyebrow">REQUISITOS</span><h2>Lo que necesitas para afiliarte</h2><p>No hay que cargar expedientes ni pagar para activar tu agencia. FortunaBet valida tus datos al registrarte.</p><a class="ag-btn green" href="${REGISTER_URL}" ${external}>Registrar mi agencia online ${ext}</a></div>
      <div class="ag-req-cols">
        <div><h3>Para activar tu agencia</h3><ul>${requirements.map(rule => `<li>${icon('check', 18)}<span>${rule}</span></li>`).join('')}</ul></div>
        <div><h3>Para retirar al banco</h3><ul>${withdrawals.map(rule => `<li>${icon('check', 18)}<span>${rule}</span></li>`).join('')}</ul></div>
      </div>
    </div>
  </section>

  <section class="ag-section ag-soft" id="preguntas">
    <div class="ag-container ag-faq-grid">
      <div class="ag-heading"><span class="ag-eyebrow dark">PREGUNTAS FRECUENTES</span><h2>Antes de afiliarte<span>.</span></h2><p>Para soporte de tu cuenta, comisiones o retiros, comunícate con FortunaBet desde su plataforma.</p></div>
      <div class="ag-faq">${faqs.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
    </div>
  </section>

  <section class="ag-cta">
    <div class="ag-container ag-cta-inner">
      <div><h2>¿Listo para tener tu agencia online?</h2><p>Crea tu cuenta en FortunaBet y activa tu Wallet de Agencias.</p></div>
      <div class="ag-actions"><a class="ag-btn green" href="${REGISTER_URL}" ${external}>Registrar mi agencia online ${ext}</a><a class="ag-btn ghost" href="${WALLET_URL}" ${external}>Ya soy agencia · Entrar ${ext}</a></div>
    </div>
    <p class="ag-container ag-notice">Juega con responsabilidad · Solo mayores de 18 años. Las comisiones, los saldos y los retiros de las agencias son gestionados por FortunaBet. Información de referencia sujeta a validación oficial de la Lotería de Mérida.</p>
  </section>
</main>`;
}

export function initAgencias(element) {
  document.title = 'Agencias online · Afiliación con FortunaBet · Lotería de Mérida';
  element.innerHTML = agenciasMarkup();
}

export const FORTUNABET = { FORTUNABET_URL, WALLET_URL, REGISTER_URL };
