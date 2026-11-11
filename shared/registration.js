export const SOURCE = {
 title: 'REQUISITOS Y TARIFAS · Lotería de Mérida',
 provision: 'Documento de referencia de requisitos y tarifas · Lotería de Mérida · 2026',
 notice: 'Requisitos de referencia de la Lotería de Mérida pendientes de validación oficial. El registro en este portal y la aprobación de un expediente no constituyen una licencia oficial.',
 url: '/documentos/requisitos-y-tarifas-loteria-merida.pdf',
 version: 'merida-2025-reference-v1',
};
const constitution = 'Acta o documento constitutivo debidamente registrado, con objeto exclusivo de explotación de actividades de envite y azar.';
const representation = 'Poder o acta de asamblea registrada que acredite la representación, acompañado de copia de la cédula de identidad.';
const shareholders = 'Relación de accionistas y representante legal: identificación, nombres, apellidos, edad, RIF, nacionalidad, estado civil, domicilio, contactos y correos personales; suscrita por el representante legal y con sello húmedo.';
const premises = 'Documento de propiedad o contrato de arrendamiento del inmueble, debidamente autenticado.';
const organization = 'Estructura y manual organizacional adecuados a las normas de prevención, control y fiscalización de legitimación de capitales y financiamiento al terrorismo en juegos de lotería.';
const compliance = 'Declaración jurada de aceptación y dedicación exclusiva del oficial de cumplimiento, síntesis curricular y certificación del acta de junta de su designación.';
const registrationPayment = 'Comprobante de pago por tasa de registro.';
const institutePayment = 'Comprobante de la tasa de la Lotería de Mérida derivada del registro.';
const stampPayment = 'Comprobante de tasa de registro ante la entidad tributaria del estado Mérida.';
const uniquePayment = 'Comprobante de la tasa administrativa de la Ficha Única Lotería de Mérida (F.U.L.M.).';
const row=(title,detail,options={})=>({title,detail,...options});
const shared = {
 representation: row('Representación legal',representation),
 shareholders: row('Relación de accionistas y representante',shareholders),
 rif: row('RIF vigente','Copia del Registro de Información Fiscal vigente.',{expires:true}),
 premises: row('Propiedad o arrendamiento',premises),
 economic: row('Licencia de Industria y Comercio','Licencia de actividades económicas de Industria y Comercio vigente.',{expires:true}),
 organization: row('Estructura y manual organizacional',organization),
 compliance: row('Oficial de cumplimiento',compliance),
 origin: row('Declaración de origen de fondos','Planilla de declaración de origen de fondos.'),
 registrationPayment: row('Pago de tasa de registro',registrationPayment,{payment:true}),
 institutePayment: row('Pago de tasa al instituto',institutePayment,{payment:true}),
 stampPayment: row('Pago de tasa tributaria',stampPayment,{payment:true}),
 uniquePayment: row('Pago de Ficha Única Lotería de Mérida (F.U.L.M.)',uniquePayment,{payment:true}),
};
const definitions = [
 {id:'operador',label:'Operador de juego',short:'Operador',icon:'building',description:'Empresas responsables de operar juegos de lotería.',license:300,monthly:null,requirements:[
  row('Solicitud de registro de operador','Planilla de solicitud de registro de Operador de Juego, debidamente firmada y sellada.'),
  row('Documento constitutivo del operador',constitution),shared.representation,shared.shareholders,shared.rif,shared.premises,shared.economic,
  row('Licencia del operador','Copia de la licencia emitida al operador por la Lotería de Mérida, cuando corresponda.',{expires:true}),
  row('Contrato con el instituto','Contrato entre el operador y la Lotería de Mérida, debidamente autenticado.'),
  shared.organization,shared.compliance,
  row('Registro Nacional de Contratistas','Certificado de registro vigente ante el Registro Nacional de Contratistas.',{expires:true}),
  row('Licencia de uso de marca del juego','Contrato autenticado entre el operador y el propietario intelectual del juego, cuando sean personas diferentes.',{conditional:true}),
  row('Licencia de uso con responsable informático','Contrato de licencia de uso de marca autenticado entre el operador y el responsable del programa informático.'),
  shared.registrationPayment,shared.institutePayment,shared.origin,shared.uniquePayment,
 ]},
 {id:'juego',label:'Registro de juego',short:'Juego',icon:'chart',description:'Propietarios de juegos y modalidades de lotería.',license:300,monthly:null,requirements:[
  row('Solicitud de registro de juego','Planilla de solicitud de registro de juego debidamente firmada y sellada.'),
  row('Documento constitutivo del propietario',constitution),shared.representation,shared.shareholders,shared.rif,
  row('Registro de marca SAPI','Certificado vigente de registro de marca emitido por SAPI.',{expires:true}),
  row('Reglamento del juego','Reglamento completo del juego.'),row('Manual descriptivo del juego','Manual que describa el juego y su funcionamiento.'),
  shared.registrationPayment,shared.institutePayment,shared.origin,shared.uniquePayment,
 ]},
 {id:'software',label:'Responsable del programa informático',short:'Software',icon:'monitor',description:'Propietarios de sistemas y plataformas de juegos.',license:300,monthly:100,requirements:[
  row('Solicitud de registro informático','Planilla de solicitud de registro del programa informático firmada y sellada.'),
  row('Documento constitutivo del propietario',constitution),shared.representation,shared.shareholders,shared.rif,shared.premises,shared.economic,shared.organization,shared.compliance,
  row('Relación de juegos comercializados','Relación de juegos y sociedades mercantiles operadoras, si aplica; suscrita por el representante legal.'),
  row('Propiedad de marca SAPI','Certificado vigente de propiedad de la marca emitido por SAPI.',{expires:true}),
  row('Manual técnico del programa','Identificación del lenguaje y versión del software, gestor de base de datos y versión si aplica. El código fuente se presentará a la vista ante CONALOT cuando sea requerido, bajo acuerdos de confidencialidad; a través del portal solo se solicita el manual.'),
  shared.stampPayment,shared.institutePayment,shared.origin,shared.uniquePayment,
 ]},
 {id:'centro',label:'Centro de apuestas / agencia',short:'Centro de apuestas',icon:'shop',description:'Personas naturales o jurídicas con un punto de venta.',license:120,monthly:{A:30,B:20,C:10},requirements:[
  row('Solicitud de centro de apuestas','Planilla de solicitud de registro firmada y sellada.'),
  row('Firma personal o documento constitutivo','Persona natural: documento de firma personal. Persona jurídica: acta o documento constitutivo estatutario inscrito y sus modificaciones. Objeto exclusivo de actividades de envite y azar.'),
  shared.representation,shared.rif,row('Cédula del representante legal','Copia de la cédula de identidad del representante legal.'),shared.economic,
  row('Fotografía georreferenciada','Fotografía del centro con punto georreferencial. Registra también latitud y longitud en los datos del establecimiento.',{geo:true}),
  shared.stampPayment,row('Autorizaciones de comercializadoras','Cartas de autorización emitidas por las comercializadoras.'),
  row('Pago por emisión de licencia','Comprobante de pago de la tasa administrativa de emisión de licencia a la Lotería de Mérida.',{payment:true}),
  shared.origin,shared.uniquePayment,
 ]},
 {id:'comercializador',label:'Licencia de comercializador',short:'Comercializador',icon:'building',description:'Empresas comercializadoras y su red de centros.',license:300,monthly:100,requirements:[
  row('Solicitud de comercializadora','Planilla oficial suministrada por la Lotería de Mérida, firmada y sellada.'),
  row('Documento constitutivo','Acta o documento constitutivo registrado, con objeto exclusivo de explotación de actividades de envite y azar.'),
  shared.representation,shared.shareholders,shared.premises,shared.economic,shared.institutePayment,
  row('Relación de juegos y contratos','Juegos comercializados, sociedades operadoras y sus respectivos contratos.'),
  row('Contrato de software','Contrato con la sociedad mercantil titular del software de comercialización.'),
  row('Relación de centros de apuesta','Razón social, RIF, domicilio fiscal, número y vencimiento de licencia, número y vencimiento del registro ante CONALOT, según el caso.'),
  shared.organization,shared.compliance,shared.stampPayment,shared.origin,shared.uniquePayment,
 ]},
];
export const CATEGORIES=definitions.map(c=>({...c,requirements:c.requirements.map((r,i)=>({...r,id:`${c.id}-${String(i+1).padStart(2,'0')}`,number:i+1}))}));
export const categoryById=id=>CATEGORIES.find(c=>c.id===id);
export const STATUS={draft:'Borrador',submitted:'Recibido',review:'En revisión',correction:'Requiere correcciones',approved:'Expediente aprobado',rejected:'No aprobado'};
export const DOCUMENT_STATUS={pending:'Pendiente de revisión',accepted:'Conforme',rejected:'Por corregir'};
export function feeBreakdown(category,rate=null,stamp=null){
 const c=categoryById(category);if(!c)return null;
 const ranged=typeof c.monthly==='object'&&c.monthly!==null;
 const monthly=ranged?null:c.monthly;
 const monthlyRange=ranged?`${Math.min(...Object.values(c.monthly))} a ${Math.max(...Object.values(c.monthly))}`:null;
 return {license:c.license,unique:20,initialUnits:c.license+20,monthly:monthly??null,monthlyRange,annualLicense:true,stamp:stamp??null,
  initialBs:rate>0?Math.round((c.license+20)*rate*100)/100:null,monthlyBs:rate>0&&monthly!=null?Math.round(monthly*rate*100)/100:null};
}
export const RAFFLES={permanentUnits:20,note:'Rifas permanentes, ocasionales y juegos publicitarios o promocionales: requisitos según el Aviso Oficial PRE-CONALOT-AO-001-2023. La solicitud en línea de estos permisos se habilitará próximamente.'};
