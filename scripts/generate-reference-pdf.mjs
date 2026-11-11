// Genera public/documentos/requisitos-y-tarifas-loteria-merida.pdf a partir del
// catálogo de requisitos del portal (shared/registration.js).
// Uso: node scripts/generate-reference-pdf.mjs
import { readFile, mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { CATEGORIES, SOURCE, RAFFLES, feeBreakdown } from '../shared/registration.js';

const OUT = `public${SOURCE.url}`;
const logo = `data:image/jpeg;base64,${(await readFile('public/logo.jpg')).toString('base64')}`;
const gobLogo = `data:image/png;base64,${(await readFile('public/assets/brand.png')).toString('base64')}`;
const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const monthly = f => f.monthlyRange ? `${f.monthlyRange} unidades*` : f.monthly == null ? 'No indicada' : `${f.monthly} unidades`;

const summary = CATEGORIES.map((c, i) => {
  const f = feeBreakdown(c.id);
  return `<tr><td>${i + 1}. ${esc(c.label)}</td><td>${f.license}</td><td>${f.unique}</td><td><strong>${f.initialUnits}</strong></td><td>${monthly(f)}</td></tr>`;
}).join('');

const sections = CATEGORIES.map((c, i) => {
  const f = feeBreakdown(c.id);
  return `<section class="category">
  <h2><span>Sección ${i + 1}</span>${esc(c.label)}</h2>
  <p class="lead">${esc(c.description)} · ${c.requirements.length} recaudos</p>
  <div class="fees"><div><small>Licencia anual</small><b>${f.license} u.</b></div><div><small>F.U.L.M.</small><b>${f.unique} u.</b></div><div><small>Registro inicial</small><b>${f.initialUnits} u. + timbre</b></div><div><small>Contribución mensual</small><b>${monthly(f)}</b></div></div>
  <ol>${c.requirements.map(r => `<li><strong>${esc(r.title)}</strong>${r.conditional ? ' <em>(si aplica)</em>' : ''}${r.expires ? ' <em>(con fecha de vencimiento)</em>' : ''}<br>${esc(r.detail)}</li>`).join('')}</ol>
</section>`;
}).join('');

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@page{size:Letter;margin:27mm 16mm 20mm}
*{box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1d3249;font-size:9.6pt;line-height:1.4;margin:0}
h1,h2,h3{color:#0a2e52;margin:0}
.logos{display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;margin-bottom:14px;border-bottom:1px solid #d5e0ea}
.logos .gob{height:46px;width:auto}
.logos .lot{height:62px;width:62px}
.cover{border-bottom:3px solid #b3262f;padding-bottom:14px}
.cover small{display:block;letter-spacing:1.5px;font-size:8.5pt;color:#55708a;text-transform:uppercase}
.cover h1{font-size:23pt;line-height:1.15;margin:4px 0}
.cover p{margin:0;color:#55708a}
.notice{background:#f3f7fb;border-left:4px solid #1d6aa8;padding:10px 14px;margin:16px 0;font-size:9.5pt}
h2.block{font-size:12pt;margin:13px 0 6px;border-bottom:1px solid #d5e0ea;padding-bottom:4px}
table{width:100%;border-collapse:collapse;font-size:9.5pt}
th{background:#0a2e52;color:#fff;text-align:left;padding:7px 8px;font-weight:600}
td{padding:5px 8px;border-bottom:1px solid #dfe7ef}
tr:nth-child(even) td{background:#f8fafc}
.note{font-size:8.8pt;color:#55708a;margin-top:6px}
ul.terms{padding-left:18px;margin:6px 0}ul.terms li{margin-bottom:4px}
.category{break-before:page}
.category h2{font-size:16pt;border-bottom:2px solid #2f7d4f;padding-bottom:6px}
.category h2 span{display:block;font-size:8.5pt;letter-spacing:1.5px;text-transform:uppercase;color:#2f7d4f}
.lead{color:#55708a;margin:6px 0 12px}
.fees{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}
.fees div{border:1px solid #d5e0ea;border-radius:6px;padding:7px 9px}
.fees small{display:block;font-size:8pt;color:#55708a}.fees b{font-size:10.5pt;color:#0a2e52}
ol{padding-left:22px;margin:0}ol li{margin-bottom:7px;break-inside:avoid}
em{color:#8a5a12;font-style:normal;font-size:9pt}
.final{break-before:page}
</style></head><body>
<header class="cover"><div><h1>Requisitos y Tarifas para el Registro</h1><p>Lotería de Mérida · Documento de referencia 2026</p></div></header>
<div class="notice"><strong>Documento referencial.</strong> Describe los recaudos y tarifas que se gestionan a través del Portal en Línea del instituto. Está sujeto a aprobación oficial y no sustituye los actos administrativos publicados. El registro y la aprobación de un expediente en el portal no constituyen una licencia.</div>
<h2 class="block">A. Unidad de cálculo</h2>
<p>Las tarifas se expresan en <strong>unidades</strong>. Cada unidad equivale a un (1) dólar estadounidense al tipo de cambio oficial publicado por el Banco Central de Venezuela (BCV) vigente para la fecha de pago. El registro inicial comprende la licencia anual y la Ficha Única Lotería de Mérida (F.U.L.M.), más un (1) timbre fiscal. La contribución mensual se liquida por separado.</p>
<h2 class="block">B. Resumen de tarifas</h2>
<table><thead><tr><th>Tipo de registro</th><th>Licencia anual</th><th>F.U.L.M.</th><th>Registro inicial</th><th>Contribución mensual</th></tr></thead><tbody>${summary}</tbody></table>
<p class="note">Montos en unidades (1 unidad = 1 USD a la tasa oficial del BCV). * Para centros de apuestas, la contribución mensual depende de la clasificación que asigne el instituto al establecimiento.</p>
<h2 class="block">C. ¿Qué es la F.U.L.M.?</h2>
<p>La <strong>Ficha Única Lotería de Mérida (F.U.L.M.)</strong> es el registro administrativo único de cada operador, propietario de juego, responsable de software, centro de apuestas o comercializador ante la Lotería de Mérida. Su tasa administrativa es de <strong>20 unidades</strong> y se paga junto con la licencia en el registro inicial.</p>
<h2 class="block">D. Condiciones generales</h2>
<ul class="terms">
<li>Los recaudos se consignan en formato digital (PDF, JPG o PNG, hasta 10 MB cada uno) a través del Portal en Línea. Los documentos de varias páginas se presentan en un único PDF.</li>
<li>Las planillas, declaraciones y relaciones deben estar firmadas por el representante legal y selladas cuando así se indique.</li>
<li>Los documentos con vencimiento deben estar vigentes al momento de su consignación.</li>
<li>Los recaudos marcados «si aplica» pueden sustituirse por una justificación escrita, sujeta a evaluación del instituto.</li>
<li>Los pagos se realizan por los canales que indique el instituto y se declaran en el portal con su referencia bancaria y comprobante.</li>
<li>El instituto podrá solicitar documentos adicionales o la presentación de originales para su verificación.</li>
</ul>

${sections}
<section class="final"><h2 class="block">Rifas y juegos promocionales</h2><p>${esc(RAFFLES.note)}</p><p>Tasa de referencia para rifas permanentes: <strong>${RAFFLES.permanentUnits} unidades</strong>.</p>
<h2 class="block">Atención al solicitante</h2><p>Las consultas sobre este documento y el proceso de registro se atienden a través de Atención ciudadana del instituto y del centro de ayuda del Portal en Línea (sección «Ayuda»).</p></section>
</body></html>`;

await mkdir('public/documentos', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true }).catch(() => chromium.launch({ headless: true }));
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.pdf({
  path: OUT, format: 'Letter', printBackground: true, displayHeaderFooter: true,
  headerTemplate: `<div style="width:100%;padding:0 16mm;display:flex;justify-content:space-between;align-items:center;font-family:Arial;font-size:7px;color:#6b8196"><img src="${gobLogo}" style="height:34px"><span>Instituto de Beneficencia Pública y Asistencia Social del Estado Mérida</span><img src="${logo}" style="height:42px;width:42px"></div>`,
  footerTemplate: '<div style="width:100%;font-size:8px;color:#6b8196;padding:0 16mm;display:flex;justify-content:space-between;font-family:Arial"><span>Lotería de Mérida · Requisitos y Tarifas · Documento de referencia 2026</span><span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span></div>',
  margin: { top: '27mm', bottom: '20mm', left: '16mm', right: '16mm' },
});
await browser.close();
console.log(`PDF generado: ${OUT}`);
