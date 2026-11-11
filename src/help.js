import { CATEGORIES, SOURCE, STATUS, DOCUMENT_STATUS } from '../shared/registration.js';

const STEPS = [
  ['Crea tu cuenta', 'Regístrate con tu nombre, correo y una contraseña de al menos 12 caracteres. Con esa cuenta podrás entrar cuando quieras a retomar tus trámites.'],
  ['Inicia un registro', 'En «Nuevo registro» elige la actividad que deseas registrar. Se abrirá un expediente con un número de seguimiento (por ejemplo, MER-…).'],
  ['Completa tus datos', 'En «Datos del registro» indica la razón social, RIF, domicilio y representante legal. Puedes guardar un borrador incompleto y continuar después.'],
  ['Adjunta los recaudos', 'En «Recaudos» encontrarás la lista de documentos de tu actividad. Adjunta cada uno por separado; el portal guarda tu avance automáticamente.'],
  ['Declara tus pagos', 'En «Tarifas y pagos» consulta los montos de referencia y registra la referencia bancaria de cada pago junto con su comprobante.'],
  ['Revisa y envía', 'En «Revisión y envío» verifica que no falte nada, acepta la declaración de veracidad y envía el expediente. A partir de ese momento queda bloqueado para edición.'],
  ['Atiende las observaciones', 'El personal del instituto revisa cada documento. Si algo debe corregirse, el expediente vuelve a ti con las observaciones para que lo actualices y lo reenvíes.'],
];

const STATUS_HELP = {
  draft: 'Lo estás preparando. Puedes editar datos y documentos libremente.',
  submitted: 'Lo enviaste y está en cola para su revisión. No se puede editar.',
  review: 'El personal del instituto está revisando tus documentos y pagos.',
  correction: 'Debes corregir lo indicado en las observaciones y volver a enviarlo.',
  approved: 'La revisión documental concluyó satisfactoriamente.',
  rejected: 'El expediente no fue aprobado. Consulta el motivo en «Seguimiento».',
};
const DOCUMENT_HELP = {
  pending: 'Adjuntado, aún sin revisar.',
  accepted: 'Revisado y aceptado por el instituto.',
  rejected: 'Requiere que adjuntes una nueva versión.',
};

const FAQ = [
  ['¿Crear una cuenta o aprobar un expediente equivale a obtener una licencia?', 'No. El portal sirve para preparar, enviar y dar seguimiento a tu expediente. La licencia es un acto administrativo que el instituto emite por sus canales oficiales.'],
  ['¿Qué tipo de registro debo elegir?', `Depende de tu actividad: ${CATEGORIES.map(c => `<strong>${c.label}</strong> (${c.description.charAt(0).toLowerCase()}${c.description.slice(1, -1)})`).join('; ')}. Si tienes dudas, consulta «Requisitos y tarifas» antes de iniciar.`],
  ['¿Puedo guardar y continuar después?', 'Sí. Todo lo que guardas queda como borrador en «Mis expedientes». Puedes cerrar sesión y retomarlo en cualquier momento.'],
  ['¿Qué formatos de archivo se aceptan?', 'PDF, JPG o PNG, con un máximo de 10 MB por recaudo. El portal verifica el contenido real del archivo, no solo su extensión.'],
  ['Mi documento tiene varias páginas, ¿cómo lo adjunto?', 'Únelas en un solo PDF y adjúntalo en el recaudo correspondiente. Cada recaudo admite un archivo; si lo vuelves a subir, reemplaza al anterior.'],
  ['Un recaudo no aplica a mi caso, ¿qué hago?', 'Los recaudos marcados como «Si aplica» permiten escribir una justificación en lugar de adjuntar un archivo. El instituto evaluará esa justificación.'],
  ['¿Por qué algunos documentos piden fecha de vencimiento?', 'Porque tienen vigencia limitada (por ejemplo, solvencias o licencias). Indica la fecha que aparece en el documento; debe estar vigente al momento de cargarlo.'],
  ['¿Puedo modificar el expediente después de enviarlo?', 'No mientras está en revisión. Si el instituto solicita correcciones, el expediente se desbloquea para que actualices lo indicado y lo reenvíes.'],
  ['¿Cómo me entero de las observaciones?', 'El estado cambia a «Requiere correcciones» y verás cada observación en el recaudo afectado y en la pestaña «Seguimiento». El portal no envía correos automáticos, así que te recomendamos ingresar con regularidad.'],
  ['¿Qué es la F.U.L.M.?', 'Es la Ficha Única Lotería de Mérida: el registro administrativo de cada solicitante ante la Lotería de Mérida. Su tasa de referencia es de 20 unidades y se suma a la licencia en el registro inicial.'],
  ['¿Qué es una «unidad» en las tarifas?', 'Las tarifas se expresan en unidades. Cada unidad equivale a un dólar al tipo de cambio oficial del Banco Central de Venezuela (BCV). El portal consulta la tasa oficial automáticamente; usa la «Calculadora de unidades» del menú para convertir cualquier monto a bolívares.'],
  ['¿Cuánto paga mensualmente un centro de apuestas?', 'Entre 10 y 30 unidades al mes, según la clasificación que el instituto asigne al establecimiento tras su evaluación.'],
  ['¿El portal procesa pagos?', 'No. Realiza el pago por los canales que indique el instituto y luego registra en el portal la referencia bancaria, el monto, la fecha y el comprobante para su verificación.'],
  ['¿Puedo tener más de un expediente?', 'Sí. Puedes abrir un expediente por cada actividad o establecimiento que necesites registrar, todos desde la misma cuenta.'],
  ['¿Quién puede ver mis documentos?', 'Solo tú y el personal de gestión del instituto. Los archivos se guardan de forma privada y no son accesibles públicamente.'],
  ['¿Cuánto tarda la revisión?', 'Depende del volumen de solicitudes y de que el expediente esté completo. Puedes consultar en todo momento el estado y el historial en «Seguimiento».'],
  ['Olvidé mi contraseña, ¿qué hago?', 'Comunícate con el instituto a través de Atención ciudadana para que el administrador verifique tu identidad y te ayude a recuperar el acceso.'],
];

const STAFF = [
  ['Bandeja de expedientes', 'Busca por número, nombre o RIF y filtra por estado o tipo de registro. Puedes exportar el listado en CSV.'],
  ['Revisión documental', 'En cada recaudo marca «Conforme» o «Solicitar corrección» y deja una observación para el solicitante.'],
  ['Revisión de pagos', 'Contrasta la referencia declarada con el comprobante y marca el pago como conforme u observado.'],
  ['Decisión del expediente', 'Inicia la revisión, devuélvelo para correcciones, apruébalo o no lo apruebes. Para aprobar, todos los recaudos y pagos deben estar conformes.'],
  ['Calculadora y parámetros', 'Elige si las unidades se convierten con el dólar o el euro oficial del BCV (actualizados automáticamente) o con una tasa manual, y registra el valor del timbre fiscal.'],
];

export function helpContent(user) {
  const admin = user?.role === 'admin';
  const steps = `<ol class="p-help-steps">${STEPS.map(([title, text], i) => `<li><span>${String(i + 1).padStart(2, '0')}</span><div><strong>${title}</strong><p>${text}</p></div></li>`).join('')}</ol>`;
  const statusList = (labels, help) => `<dl class="p-help-status">${Object.entries(help).map(([id, text]) => `<div><dt><span class="p-badge ${id}">${labels[id]}</span></dt><dd>${text}</dd></div>`).join('')}</dl>`;
  const staff = `<section class="p-card${admin ? ' p-help-highlight' : ''}"><h2>Para el personal de gestión</h2><p class="p-muted">Funciones disponibles para las cuentas institucionales.</p><ul class="p-help-list">${STAFF.map(([t, d]) => `<li><strong>${t}</strong><p>${d}</p></li>`).join('')}</ul></section>`;
  return `<div class="p-heading"><span class="p-eyebrow">CENTRO DE AYUDA</span><h1>¿Cómo funciona el portal?</h1><p>Todo lo que necesitas saber para registrar tu actividad ante la Lotería de Mérida, paso a paso.</p></div>
  <nav class="p-help-index" aria-label="Contenido de la ayuda"><a href="#ayuda-pasos">Paso a paso</a><a href="#ayuda-estados">Estados</a><a href="#ayuda-archivos">Archivos</a><a href="#ayuda-faq">Preguntas frecuentes</a></nav>
  ${admin ? staff : ''}
  <section class="p-card" id="ayuda-pasos"><h2>Paso a paso</h2><p class="p-muted">Del registro de tu cuenta a la aprobación del expediente.</p>${steps}</section>
  <section class="p-card" id="ayuda-estados"><h2>¿Qué significa cada estado?</h2><h3 class="p-subheading">Estado del expediente</h3>${statusList(STATUS, STATUS_HELP)}<h3 class="p-subheading">Estado de cada recaudo</h3>${statusList(DOCUMENT_STATUS, DOCUMENT_HELP)}</section>
  <section class="p-card" id="ayuda-archivos"><h2>Antes de adjuntar documentos</h2><ul class="p-help-list p-help-tips"><li><strong>Formatos</strong><p>PDF, JPG o PNG, hasta 10 MB por recaudo.</p></li><li><strong>Legibilidad</strong><p>Escanea con buena luz y resolución; los sellos y firmas deben verse con claridad.</p></li><li><strong>Un archivo por recaudo</strong><p>Si un documento tiene varias páginas, únelas en un solo PDF.</p></li><li><strong>Vigencia</strong><p>Los documentos con vencimiento deben estar vigentes al cargarlos.</p></li></ul><a class="p-text-link" href="${SOURCE.url}" target="_blank" rel="noopener">Descargar el documento de requisitos y tarifas (PDF) ↓</a></section>
  <section class="p-card" id="ayuda-faq"><h2>Preguntas frecuentes</h2><div class="p-faq">${FAQ.map(([q, a]) => `<details><summary>${q}<span class="p-chevron">⌄</span></summary><p>${a}</p></details>`).join('')}</div></section>
  <div class="p-help-strip"><strong>¿Aún tienes dudas?</strong><span>Comunícate con el instituto a través de <a href="/contacto">Atención ciudadana</a>.</span></div>`;
}
