// Tipo de cambio oficial del Banco Central de Venezuela (dólar y euro).
//
// Fuente principal: https://www.bcv.org.ve (consulta directa a la página oficial).
// El servidor del BCV no envía su certificado intermedio (Sectigo), por lo que Node
// lo rechaza. En lugar de desactivar la verificación TLS, se descarga ese intermedio
// desde la dirección "CA Issuers" que el propio certificado declara y se valida la
// cadena completa contra las autoridades raíz de confianza.
//
// Respaldo: ve.dolarapi.com, que replica las tasas oficiales del BCV.
// Se consulta al arrancar y cada 30 minutos; la última tasa válida se guarda en la
// base de datos para seguir funcionando sin conexión.
import https from 'node:https';
import http from 'node:http';
import tls from 'node:tls';
import { X509Certificate } from 'node:crypto';
import { db, settings } from './store.mjs';

const BCV_HOST = 'www.bcv.org.ve';
const BACKUP = { usd: 'https://ve.dolarapi.com/v1/dolares/oficial', eur: 'https://ve.dolarapi.com/v1/euros/oficial' };
const REFRESH_MS = 30 * 60 * 1000;
const TIMEOUT_MS = 15000;
export const MODES = { 'bcv-usd': 'Dólar oficial BCV', 'bcv-eur': 'Euro oficial BCV', manual: 'Tasa manual' };

db.exec('CREATE TABLE IF NOT EXISTS exchange_rates(id INTEGER PRIMARY KEY CHECK(id=1),value TEXT NOT NULL)');
let latest = (() => { try { return JSON.parse(db.prepare('SELECT value FROM exchange_rates WHERE id=1').get()?.value || 'null'); } catch { return null; } })();
let lastError = null;
let pending = null;
let intermediatePem = null;

function download(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const request = client.get(url, { timeout: TIMEOUT_MS, headers: { 'User-Agent': 'PortalInstitutoMerida/1.0', Accept: '*/*' }, ...options }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        return resolve(download(new URL(response.headers.location, url).href, options));
      }
      if (response.statusCode !== 200) { response.resume(); return reject(Error(`HTTP ${response.statusCode}`)); }
      const chunks = [];
      response.on('data', c => chunks.push(c));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });
    request.on('timeout', () => request.destroy(Error('Tiempo de espera agotado')));
    request.on('error', reject);
  });
}

// Obtiene el certificado intermedio que el servidor del BCV omite.
async function bcvIntermediate() {
  if (intermediatePem) return intermediatePem;
  const issuerUrl = await new Promise((resolve, reject) => {
    // Solo se lee el certificado público para conocer su emisor; aquí no se envían ni reciben datos.
    const socket = tls.connect({ host: BCV_HOST, port: 443, servername: BCV_HOST, rejectUnauthorized: false, timeout: TIMEOUT_MS }, () => {
      const url = socket.getPeerCertificate().infoAccess?.['CA Issuers - URI']?.[0];
      socket.end();
      url ? resolve(url) : reject(Error('El certificado del BCV no indica su emisor'));
    });
    socket.on('timeout', () => socket.destroy(Error('Tiempo de espera agotado')));
    socket.on('error', reject);
  });
  if (!/^https?:\/\//.test(issuerUrl)) throw Error('Emisor de certificado no válido');
  const der = await download(issuerUrl);
  const cert = new X509Certificate(der);
  if (!cert.ca) throw Error('El certificado descargado no es de una autoridad certificadora');
  intermediatePem = cert.toString();
  return intermediatePem;
}

function parseAmount(text) {
  const value = Number(String(text).trim().replace(/\./g, '').replace(',', '.'));
  if (!Number.isFinite(value) || value <= 0) throw Error('Tasa no válida en la página del BCV');
  return value;
}

// Consulta directa a la página oficial del BCV.
async function fromBcv() {
  // La verificación TLS sigue activa: raíces de confianza + intermedio declarado por el certificado.
  const ca = [...tls.rootCertificates, await bcvIntermediate()];
  const html = (await download(`https://${BCV_HOST}/`, { ca })).toString('utf8');
  const pick = id => {
    const match = html.match(new RegExp(`id="${id}"[\\s\\S]*?<strong[^>]*>\\s*([\\d.,]+)\\s*</strong>`));
    if (!match) throw Error(`No se encontró la tasa ${id} en la página del BCV`);
    return parseAmount(match[1]);
  };
  const date = html.match(/Fecha Valor:[\s\S]*?content="(\d{4}-\d{2}-\d{2})/)?.[1] || '';
  return { usd: pick('dolar'), eur: pick('euro'), date, source: 'bcv.org.ve' };
}

// Respaldo: réplica pública de las tasas oficiales del BCV.
async function fromBackup() {
  const get = async url => {
    const data = JSON.parse((await download(url)).toString('utf8'));
    const value = Number(data.promedio ?? data.venta);
    if (!Number.isFinite(value) || value <= 0) throw Error('Respuesta sin tasa válida');
    return { value, date: String(data.fechaActualizacion || '').slice(0, 10) };
  };
  const [usd, eur] = await Promise.all([get(BACKUP.usd), get(BACKUP.eur)]);
  return { usd: usd.value, eur: eur.value, date: usd.date || eur.date, source: 've.dolarapi.com (réplica BCV)' };
}

export function refreshRates() {
  pending ??= (async () => {
    const errors = [];
    for (const source of [fromBcv, fromBackup]) {
      try {
        const rates = await source();
        latest = { ...rates, fetchedAt: new Date().toISOString() };
        db.prepare('INSERT INTO exchange_rates(id,value) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value').run(JSON.stringify(latest));
        lastError = null;
        if (errors.length) console.warn(`Tasas BCV obtenidas del respaldo. Consulta directa: ${errors[0]}`);
        break;
      } catch (error) {
        errors.push(error.cause?.code || error.code || error.message);
      }
    }
    if (errors.length === 2) {
      lastError = errors.join(' · ');
      console.warn(`No se pudieron consultar las tasas del BCV: ${lastError}`);
    }
    pending = null;
    return bcvStatus();
  })();
  return pending;
}

export function bcvStatus() {
  return latest
    ? { ...latest, stale: Date.now() - Date.parse(latest.fetchedAt) > 26 * 3600 * 1000, error: lastError }
    : { usd: null, eur: null, date: '', source: '', fetchedAt: null, stale: true, error: lastError };
}

// Parámetros de cálculo efectivos: en modo automático la tasa proviene del BCV.
export function effectiveSettings() {
  const saved = settings();
  const mode = saved.rateMode || (saved.rate != null ? 'manual' : 'bcv-usd');
  const bcv = bcvStatus();
  if (mode !== 'manual') {
    const rate = mode === 'bcv-eur' ? bcv.eur : bcv.usd;
    return { ...saved, rateMode: mode, rate: rate ?? null, rateDate: rate ? bcv.date : '', rateSource: rate ? `${MODES[mode]} · Banco Central de Venezuela` : '', manualRate: saved.rate ?? null, bcv };
  }
  return { ...saved, rateMode: 'manual', bcv };
}

if (process.env.PORTAL_BCV !== 'off') {
  refreshRates().then(status => { if (status.usd) console.log(`Tasa BCV: USD ${status.usd} · EUR ${status.eur} · ${status.date} (${status.source})`); });
  setInterval(refreshRates, REFRESH_MS).unref();
}
