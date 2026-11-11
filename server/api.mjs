import express from 'express';
import multer from 'multer';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { db, dataDir, now, hashPassword, checkPassword, event, settings } from './store.mjs';
import { effectiveSettings, refreshRates, bcvStatus, MODES } from './bcv.mjs';
import { CATEGORIES, SOURCE, RAFFLES, categoryById, feeBreakdown } from '../shared/registration.js';

export const api=express.Router();
api.use(express.json({limit:'150kb'}));
api.use((req,res,next)=>{
 res.set('Cache-Control','no-store');res.set('X-Content-Type-Options','nosniff');
 if(!['GET','HEAD','OPTIONS'].includes(req.method)){
  if(req.get('X-Portal-Request')!=='1')return res.status(403).json({error:'Solicitud no autorizada.'});
  if(req.get('origin')){try{if(new URL(req.get('origin')).host!==req.get('host'))return res.status(403).json({error:'Origen no permitido.'});}catch{return res.status(403).json({error:'Origen inválido.'});}}
 }
 const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('portal_session='))?.slice(15);
 if(token)req.user=db.prepare('SELECT u.id,u.name,u.email,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>?').get(createHash('sha256').update(token).digest('hex'),Date.now());
 next();
});
const fail=(message,status=400)=>{const e=new Error(message);e.status=status;throw e;};
const clean=(value,max=500)=>typeof value==='string'?value.trim().slice(0,max):'';
const isDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
const requireUser=(req,res,next)=>req.user?next():res.status(401).json({error:'Inicia sesión para continuar.'});
const requireAdmin=(req,res,next)=>req.user?.role==='admin'?next():res.status(403).json({error:'Se requiere acceso de gestión.'});
function application(req){const app=db.prepare('SELECT * FROM applications WHERE id=?').get(req.params.id);if(!app)fail('Expediente no encontrado.',404);if(app.user_id!==req.user.id&&req.user.role!=='admin')fail('No tienes acceso a este expediente.',403);return {...app,details:JSON.parse(app.details)};}
function editable(req){const app=application(req);if(app.user_id!==req.user.id)fail('Solo el solicitante puede modificar sus recaudos.',403);if(!['draft','correction'].includes(app.status))fail('El expediente está en revisión o cerrado. No se puede modificar.',409);return app;}
function serialize(app){const details=typeof app.details==='string'?JSON.parse(app.details):app.details;const docs=db.prepare('SELECT id,requirement_id,filename,mime,size,expires,waiver,status,comment,updated_at FROM documents WHERE application_id=? ORDER BY requirement_id').all(app.id);const config=effectiveSettings();return {...app,details,documents:docs,fees:feeBreakdown(app.category,config.rate,config.stamp)};}
const attempts=new Map();
function limit(req,res,next){const key=req.ip;const time=Date.now();const a=attempts.get(key)||{count:0,until:time+15*60*1000};if(a.until<time){a.count=0;a.until=time+15*60*1000;}a.count++;attempts.set(key,a);if(attempts.size>1000)for(const [k,v]of attempts)if(v.until<time)attempts.delete(k);if(a.count>25)return res.status(429).json({error:'Demasiados intentos. Intenta de nuevo en 15 minutos.'});next();}
function setSession(req,res,user){const token=randomBytes(32).toString('hex');db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(createHash('sha256').update(token).digest('hex'),user.id,Date.now()+12*60*60*1000);res.cookie('portal_session',token,{httpOnly:true,sameSite:'strict',secure:req.secure,path:'/api',maxAge:12*60*60*1000});}

api.get('/catalog',async(_req,res)=>{if(!bcvStatus().usd)await Promise.race([refreshRates(),new Promise(r=>setTimeout(r,5000))]);res.json({categories:CATEGORIES,source:SOURCE,raffles:RAFFLES,settings:effectiveSettings()});});
api.get('/bcv',(_req,res)=>res.json(bcvStatus()));
api.get('/session',(req,res)=>res.json({user:req.user||null}));
api.post('/register',limit,async(req,res)=>{
 const name=clean(req.body.name,120),email=clean(req.body.email,180).toLowerCase(),password=req.body.password;
 if(name.length<3||!/^\S+@\S+\.\S+$/.test(email)||typeof password!=='string'||password.length<12||password.length>128)fail('Indica tu nombre, un correo válido y una contraseña de 12 a 128 caracteres.');
 if(req.body.consent!==true)fail('Debes aceptar el uso de datos para gestionar tu registro.');
 if(db.prepare('SELECT id FROM users WHERE email=?').get(email))fail('Ese correo ya tiene una cuenta. Inicia sesión.',409);
 const passwordHash=await hashPassword(password);const user={id:randomUUID(),name,email,role:'applicant'};
 try{db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?)').run(user.id,name,email,passwordHash,'applicant',now());}catch(e){if(e.code?.startsWith('ERR_SQLITE'))fail('Ese correo ya tiene una cuenta.',409);throw e;}
 setSession(req,res,user);res.status(201).json({user});
});
api.post('/login',limit,async(req,res)=>{
 const email=clean(req.body.email,180).toLowerCase();const password=req.body.password;
 if(typeof password!=='string'||password.length>128)fail('Credenciales incorrectas.',401);
 const user=db.prepare('SELECT * FROM users WHERE email=?').get(email);
 if(!user||!await checkPassword(password,user.password))fail('Correo o contraseña incorrectos.',401);
 setSession(req,res,user);const {password:_,...safe}=user;res.json({user:safe});
});
api.post('/logout',(req,res)=>{const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('portal_session='))?.slice(15);if(token)db.prepare('DELETE FROM sessions WHERE token=?').run(createHash('sha256').update(token).digest('hex'));res.clearCookie('portal_session',{path:'/api'});res.json({ok:true});});
api.use(requireUser);
api.get('/applications',(req,res)=>{const rows=req.user.role==='admin'?db.prepare('SELECT a.*,u.name AS applicant_name,u.email AS applicant_email FROM applications a JOIN users u ON u.id=a.user_id ORDER BY a.updated_at DESC').all():db.prepare('SELECT * FROM applications WHERE user_id=? ORDER BY updated_at DESC').all(req.user.id);res.json({applications:rows.map(serialize)});});
api.post('/applications',(req,res)=>{
 if(req.user.role!=='applicant')fail('El personal de gestión no crea expedientes de solicitante.',403);
 if(!categoryById(req.body.category))fail('Selecciona un tipo de registro válido.');
 if(db.prepare('SELECT count(*) AS n FROM applications WHERE user_id=?').get(req.user.id).n>=30)fail('Has alcanzado el límite de expedientes. Contacta con atención ciudadana.');
 const id=`MER-${new Date().getFullYear()}-${randomBytes(5).toString('hex').toUpperCase()}`;
 db.prepare('INSERT INTO applications(id,user_id,category,version,created_at,updated_at) VALUES(?,?,?,?,?,?)').run(id,req.user.id,req.body.category,SOURCE.version,now(),now());event(id,req.user.id,'Expediente creado como borrador.');res.status(201).json({id});
});
api.get('/applications/:id',(req,res)=>{const app=application(req);res.json({application:serialize(app),events:db.prepare('SELECT e.message,e.created_at,u.name AS actor FROM events e JOIN users u ON u.id=e.actor_id WHERE application_id=? ORDER BY e.id DESC').all(app.id),payments:db.prepare('SELECT * FROM payments WHERE application_id=? ORDER BY created_at DESC').all(app.id)});});
const detailFields=['legalName','rif','personType','phone','address','municipality','representative','identity','representativeEmail','centerType','latitude','longitude','gameName','softwareName','notes'];
function parseDetails(input){
 const d={};for(const k of detailFields)d[k]=clean(input[k],k==='notes'?3000:500);
 if(d.centerType&&!['A','B','C'].includes(d.centerType))fail('Clasificación de centro inválida.');
 if(d.personType&&!['natural','juridica'].includes(d.personType))fail('Tipo de persona inválido.');
 if(input.shareholders!==undefined&&!Array.isArray(input.shareholders))fail('Relación de accionistas inválida.');
 if((input.shareholders||[]).length>50)fail('Máximo 50 accionistas.');
 d.shareholders=(input.shareholders||[]).map(person=>Object.fromEntries(['name','identity','age','rif','nationality','maritalStatus','address','phone','email'].map(k=>[k,clean(person[k],300)])));
 return d;
}
api.put('/applications/:id',(req,res)=>{const app=editable(req);const details=parseDetails(req.body);db.prepare('UPDATE applications SET details=?,updated_at=? WHERE id=?').run(JSON.stringify(details),now(),app.id);res.json({ok:true});});
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:10*1024*1024,files:1,fields:3}});
function detectFile(file){const b=file.buffer;if(b.subarray(0,5).toString()==='%PDF-')return {mime:'application/pdf',ext:'.pdf'};if(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {mime:'image/png',ext:'.png'};if(b[0]===255&&b[1]===216&&b[2]===255)return {mime:'image/jpeg',ext:'.jpg'};fail('El archivo debe ser un PDF, JPG o PNG válido.');}
api.post('/applications/:id/documents/:requirement', (req,res,next)=>{editable(req);next();},upload.single('file'),async(req,res)=>{
 const app=editable(req);const requirement=categoryById(app.category).requirements.find(r=>r.id===req.params.requirement);if(!requirement)fail('Recaudo inválido.');
 const waiver=clean(req.body.waiver,1500);const expires=clean(req.body.expires,10);
 if(waiver&&(!requirement.conditional||waiver.length<10))fail('La excepción solo está disponible para el recaudo condicional y necesita una justificación.');
 if(!waiver&&!req.file)fail('Selecciona un archivo.');if(waiver&&req.file)fail('Adjunta un archivo o solicita la excepción, no ambos.');
 if(expires&&(!isDate(expires)||expires<now().slice(0,10)))fail('Indica una fecha de vencimiento vigente.');
 if(requirement.expires&&!expires&&!waiver)fail('Indica la fecha de vencimiento del documento.');
 let stored=null,format=null;
 if(req.file){format=detectFile(req.file);stored=`${randomUUID()}${format.ext}`;await writeFile(resolve(dataDir,'documents',stored),req.file.buffer,{flag:'wx'});}
 try{editable(req);}catch(error){if(stored)await unlink(resolve(dataDir,'documents',stored)).catch(()=>{});throw error;}
 const previous=db.prepare('SELECT * FROM documents WHERE application_id=? AND requirement_id=?').get(app.id,requirement.id);
 const id=previous?.id||randomUUID();
 const filename=req.file?clean(req.file.originalname.replace(/[^\p{L}\p{N} ._()-]/gu,'_'),140):null;
 db.prepare(`INSERT INTO documents(id,application_id,requirement_id,filename,path,mime,size,expires,waiver,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(application_id,requirement_id) DO UPDATE SET filename=excluded.filename,path=excluded.path,mime=excluded.mime,size=excluded.size,expires=excluded.expires,waiver=excluded.waiver,status='pending',comment='',updated_at=excluded.updated_at`).run(id,app.id,requirement.id,filename,stored,format?.mime||null,req.file?.size||0,expires||null,waiver||null,now());
 if(previous)db.prepare("UPDATE payments SET status='pending',comment='Recaudo de respaldo actualizado; requiere nueva revisión.' WHERE document_id=?").run(id);
 db.prepare('UPDATE applications SET updated_at=? WHERE id=?').run(now(),app.id);event(app.id,req.user.id,`${previous?'Actualizado':'Incorporado'} recaudo ${requirement.number}: ${requirement.title}${waiver?' (excepción solicitada)':''}.`);
 if(previous?.path)await unlink(resolve(dataDir,'documents',previous.path)).catch(()=>{});res.json({ok:true});
});
api.get('/applications/:id/documents/:document/download',(req,res)=>{const app=application(req);const doc=db.prepare('SELECT * FROM documents WHERE application_id=? AND id=?').get(app.id,req.params.document);if(!doc?.path)fail('Documento no encontrado.',404);res.set('Content-Security-Policy',"default-src 'none'; sandbox");res.type(doc.mime);res.download(resolve(dataDir,'documents',doc.path),doc.filename);});
api.post('/applications/:id/payments',(req,res)=>{
 const app=editable(req);const {documentId,purpose,reference,amount,date}=req.body;
 const doc=db.prepare('SELECT * FROM documents WHERE application_id=? AND id=?').get(app.id,documentId);
 if(!doc?.path||!categoryById(app.category).requirements.find(r=>r.id===doc.requirement_id)?.payment)fail('Selecciona un comprobante de pago adjunto al expediente.');
 if(!['licencia','registro','timbre','contribucion','otro'].includes(purpose)||clean(reference,100).length<4||typeof amount!=='number'||!Number.isFinite(amount)||amount<=0||amount>1e12||!isDate(date)||date>now().slice(0,10))fail('Revisa el concepto, referencia, monto en bolívares y fecha del pago.');
 if(db.prepare('SELECT id FROM payments WHERE application_id=? AND reference=?').get(app.id,reference))fail('Esta referencia ya está registrada en el expediente.',409);
 db.prepare('INSERT INTO payments(id,application_id,document_id,purpose,reference,amount,date,created_at) VALUES(?,?,?,?,?,?,?,?)').run(randomUUID(),app.id,documentId,purpose,clean(reference,100),amount,date,now());event(app.id,req.user.id,'Pago declarado para revisión; no constituye confirmación bancaria.');res.status(201).json({ok:true});
});
function missing(app){
 const errors=[];const d=app.details;
 for(const key of ['legalName','rif','personType','phone','address','municipality','representative','identity','representativeEmail'])if(!d[key])errors.push(`Completa ${({legalName:'razón social / nombre',rif:'RIF',personType:'tipo de persona',phone:'teléfono',address:'domicilio fiscal',municipality:'municipio',representative:'representante legal',identity:'cédula',representativeEmail:'correo del representante'})[key]}.`);
 if(d.rif&&!/^[VEJPGC]-?\d{8}-?\d$/i.test(d.rif))errors.push('El RIF debe incluir prefijo y nueve dígitos.');
 if(d.representativeEmail&&!/^\S+@\S+\.\S+$/.test(d.representativeEmail))errors.push('Correo del representante inválido.');
 if(app.category==='centro'){
  if(!d.latitude||!d.longitude||!Number.isFinite(Number(d.latitude))||!Number.isFinite(Number(d.longitude))||Math.abs(Number(d.latitude))>90||Math.abs(Number(d.longitude))>180)errors.push('Indica coordenadas geográficas válidas del centro.');
 }
 if(app.category==='juego'&&!d.gameName)errors.push('Indica el nombre del juego.');
 if(app.category==='software'&&!d.softwareName)errors.push('Indica el nombre del programa informático.');
 const docs=db.prepare('SELECT * FROM documents WHERE application_id=?').all(app.id);
 for(const r of categoryById(app.category).requirements){const doc=docs.find(d=>d.requirement_id===r.id);if(!doc)errors.push(`Falta recaudo ${r.number}: ${r.title}.`);else if(doc.status==='rejected')errors.push(`Corrige el recaudo ${r.number}: ${r.title}.`);else if(doc.expires&&doc.expires<now().slice(0,10))errors.push(`Venció el recaudo ${r.number}: ${r.title}.`);}
 return errors;
}
api.post('/applications/:id/submit',(req,res)=>{const app=editable(req);if(req.body.declaration!==true)fail('Confirma la declaración de veracidad.');const errors=missing(app);if(errors.length)return res.status(422).json({error:'El expediente requiere completar o corregir información.',details:errors});db.prepare("UPDATE applications SET status='submitted',submitted_at=?,updated_at=? WHERE id=?").run(now(),now(),app.id);event(app.id,req.user.id,'Expediente enviado para revisión. Declaración de veracidad aceptada.');res.json({ok:true});});
api.post('/applications/:id/documents/:document/review',requireAdmin,(req,res)=>{
 const app=application(req);if(!['submitted','review'].includes(app.status))fail('El expediente debe estar recibido o en revisión.',409);
 const {status}=req.body;const comment=clean(req.body.comment,2000);if(!['accepted','rejected'].includes(status)||(status==='rejected'&&comment.length<5))fail('Indica una decisión y una observación para los documentos por corregir.');
 const doc=db.prepare('SELECT * FROM documents WHERE id=? AND application_id=?').get(req.params.document,app.id);if(!doc)fail('Documento no encontrado.',404);if(status==='accepted'&&doc.expires&&doc.expires<now().slice(0,10))fail('No se puede validar un documento vencido.');
 db.prepare('UPDATE documents SET status=?,comment=? WHERE id=?').run(status,comment,doc.id);event(app.id,req.user.id,`Recaudo ${doc.requirement_id}: ${status==='accepted'?'conforme':'por corregir'}. ${comment}`);res.json({ok:true});
});
api.post('/applications/:id/payments/:payment/review',requireAdmin,(req,res)=>{
 const app=application(req);if(!['submitted','review'].includes(app.status))fail('El expediente debe estar en revisión.',409);
 const status=req.body.status,comment=clean(req.body.comment,1000);if(!['accepted','rejected'].includes(status)||(status==='rejected'&&comment.length<5))fail('Indica una decisión y motivo.');
 const result=db.prepare('UPDATE payments SET status=?,comment=? WHERE id=? AND application_id=?').run(status,comment,req.params.payment,app.id);if(!result.changes)fail('Pago no encontrado.',404);event(app.id,req.user.id,`Pago ${status==='accepted'?'validado':'observado'}. ${comment}`);res.json({ok:true});
});
api.post('/applications/:id/status',requireAdmin,(req,res)=>{
 const app=application(req);const target=req.body.status,comment=clean(req.body.comment,3000);
 const transitions={submitted:['review','correction','rejected'],review:['correction','approved','rejected']};
 if(!transitions[app.status]?.includes(target))fail('Transición de estado no permitida.',409);
 if(['correction','rejected'].includes(target)&&comment.length<10)fail('Describe las observaciones o el motivo de la decisión.');
 if(target==='approved'){
  const errors=missing(app);const docs=db.prepare('SELECT status FROM documents WHERE application_id=?').all(app.id);
  if(errors.length||docs.some(d=>d.status!=='accepted'))fail('Todos los recaudos y excepciones deben estar conformes antes de aprobar.');
  if(db.prepare("SELECT id FROM payments WHERE application_id=? AND status!='accepted'").get(app.id))fail('Revisa todos los pagos declarados antes de aprobar.');
 }
 db.prepare('UPDATE applications SET status=?,updated_at=? WHERE id=?').run(target,now(),app.id);event(app.id,req.user.id,`Estado: ${target}. ${comment}${target==='approved'?' Aprobación documental; no equivale a licencia oficial.':''}`);res.json({ok:true});
});
api.put('/settings',requireAdmin,(req,res)=>{
 const {rateDate,rateSource,stamp}=req.body;const rateMode=req.body.rateMode||'manual';const rate=rateMode==='manual'?req.body.rate:null;
 if(!MODES[rateMode])fail('Modo de tasa inválido.');
 if(rate!=null&&(typeof rate!=='number'||!Number.isFinite(rate)||rate<=0||rate>1e9||!isDate(rateDate)||rateDate>now().slice(0,10)||clean(rateSource,500).length<5))fail('Indica una tasa positiva, fecha válida y fuente verificable.');
 if(stamp!==null&&(typeof stamp!=='number'||!Number.isFinite(stamp)||stamp<0||stamp>1e9))fail('Valor de timbre inválido.');
 const value={rateMode,rate:rate??null,rateDate:rate==null?'':rateDate,rateSource:rate==null?'':clean(rateSource,500),stamp,updatedAt:now(),updatedBy:req.user.name};db.prepare('UPDATE settings SET value=? WHERE id=1').run(JSON.stringify(value));res.json({settings:effectiveSettings()});
});
api.post('/bcv/refresh',requireAdmin,async(_req,res)=>{const status=await refreshRates();if(!status.usd)fail('No se pudo consultar el BCV en este momento. Intenta más tarde.',502);res.json({settings:effectiveSettings()});});
api.use((err,req,res,_next)=>{if(err instanceof multer.MulterError)return res.status(400).json({error:err.code==='LIMIT_FILE_SIZE'?'El archivo supera el límite de 10 MB.':'La carga de archivo no es válida.'});if(err.status)return res.status(err.status).json({error:err.message});console.error('Portal API error:',err.message);res.status(500).json({error:'No se pudo completar la operación. Intenta nuevamente.'});});
