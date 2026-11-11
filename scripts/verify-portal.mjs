import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, readFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { CATEGORIES, feeBreakdown } from '../shared/registration.js';
await mkdir('tmp',{recursive:true});await mkdir('artifacts',{recursive:true});
const dir=await mkdtemp(resolve('tmp/portal-test-'));
const env={...process.env,PORTAL_DATA_DIR:dir,PORT:'3002',PORTAL_API_URL:'http://127.0.0.1:3002'};
const password='Testing-Only-Portal-2026!';
const seed=spawnSync(process.execPath,['server/admin.mjs','reviewer@example.test'],{env,input:password,encoding:'utf8'});assert.equal(seed.status,0,seed.stderr);
let browser;const children=[];
async function start(args,ready){const child=spawn(process.execPath,args,{env,stdio:'pipe'});children.push(child);await new Promise((resolve,reject)=>{child.stdout.on('data',d=>{if(d.toString().includes(ready))resolve();});child.stderr.on('data',d=>{if(!d.toString().includes('ExperimentalWarning')&&!d.toString().includes('trace-warnings'))process.stderr.write(d);});child.on('error',reject);child.on('exit',code=>reject(Error(`Server exited ${code}`)));});return child;}
const base='http://127.0.0.1:3002/api';
async function request(path,{method='GET',body,cookie='',status=200,headers={}}={}){
 const form=body instanceof FormData;
 const response=await fetch(base+path,{method,headers:{'X-Portal-Request':'1',...(body&&!form?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...headers},body:body?(form?body:JSON.stringify(body)):undefined});
 const data=await response.json();assert.equal(response.status,status,`${method} ${path}: ${JSON.stringify(data)}`);return {data,cookie:response.headers.get('set-cookie')?.split(';')[0]};
}
const details={legalName:'Empresa de prueba',rif:'J-12345678-9',personType:'juridica',phone:'04140000000',address:'Dirección de prueba',municipality:'Libertador',representative:'Persona de prueba',identity:'V-12345678',representativeEmail:'person@example.test',latitude:'8.598',longitude:'-71.144',gameName:'Juego de prueba',softwareName:'Programa de prueba',shareholders:[]};
try{
 let backend=await start(['server/index.mjs'],'Portal API ready');
 const catalog=(await request('/catalog')).data;assert.equal(catalog.categories.reduce((n,c)=>n+c.requirements.length,0),73);assert.deepEqual(CATEGORIES.map(c=>c.requirements.length),[18,12,16,12,15]);
 assert.equal(feeBreakdown('centro',100).initialBs,14000);assert.equal(feeBreakdown('centro').monthlyRange,'10 a 30');assert.equal(feeBreakdown('software',100).monthlyBs,10000);assert.equal(feeBreakdown('operador').monthly,null);
 await request('/applications',{status:401});
 const account=await request('/register',{method:'POST',status:201,body:{name:'Solicitante de prueba',email:'applicant@example.test',password,consent:true,role:'admin'}});const owner=account.cookie;assert.equal(account.data.user.role,'applicant');
 await request('/settings',{method:'PUT',cookie:owner,body:{rate:100,rateDate:'2026-01-01',rateSource:'Fuente de prueba',stamp:null},status:403});
 await request('/register',{method:'POST',body:{name:'Duplicado',email:'applicant@example.test',password,consent:true},status:409});
 const outsider=(await request('/register',{method:'POST',status:201,body:{name:'Otro solicitante',email:'other@example.test',password,consent:true}})).cookie;
 const admin=(await request('/login',{method:'POST',body:{email:'reviewer@example.test',password}})).cookie;
 await request('/settings',{method:'PUT',cookie:admin,body:{rateMode:'bcv-usd',stamp:50}});assert.equal((await request('/catalog')).data.settings.rateMode,'bcv-usd');assert.ok('usd' in (await request('/bcv')).data);await request('/bcv/refresh',{method:'POST',cookie:owner,status:403});await request('/settings',{method:'PUT',cookie:admin,body:{rateMode:'manual',rate:100,rateDate:'2026-01-01',rateSource:'Fuente de prueba de TCMMV/BCV',stamp:50}});assert.equal((await request('/catalog')).data.settings.rate,100);
 const fixture=await readFile('public/documentos/requisitos-y-tarifas-loteria-merida.pdf');
 let firstId;
 for(const c of CATEGORIES){
  const id=(await request('/applications',{method:'POST',status:201,cookie:owner,body:{category:c.id}})).data.id;firstId??=id;
  await request(`/applications/${id}`,{cookie:outsider,status:403});
  await request(`/applications/${id}`,{method:'PUT',cookie:owner,body:details});
  await request(`/applications/${id}/submit`,{method:'POST',cookie:owner,body:{declaration:true},status:422});
  for(const r of c.requirements){const form=new FormData();form.append('file',new Blob([fixture],{type:'application/pdf'}),'recaudo-prueba.pdf');if(r.expires)form.append('expires','2030-12-31');await request(`/applications/${id}/documents/${r.id}`,{method:'POST',cookie:owner,body:form});}
  const app=(await request(`/applications/${id}`,{cookie:owner})).data.application;
  const doc=app.documents.find(d=>c.requirements.find(r=>r.id===d.requirement_id).payment);
  await request(`/applications/${id}/documents/${doc.id}/download`,{cookie:outsider,status:403});
  await request(`/applications/${id}/payments`,{method:'POST',status:201,cookie:owner,body:{documentId:doc.id,purpose:'registro',reference:'TEST-12345',amount:2000,date:'2026-01-01'}});
  await request(`/applications/${id}/submit`,{method:'POST',cookie:owner,body:{declaration:true}});
  await request(`/applications/${id}`,{method:'PUT',cookie:owner,body:details,status:409});
  await request(`/applications/${id}/status`,{method:'POST',cookie:owner,body:{status:'review'},status:403});
  await request(`/applications/${id}/status`,{method:'POST',cookie:admin,body:{status:'review'}});
  await request(`/applications/${id}/status`,{method:'POST',cookie:admin,body:{status:'approved'},status:400});
  for(const d of app.documents)await request(`/applications/${id}/documents/${d.id}/review`,{method:'POST',cookie:admin,body:{status:'accepted',comment:'Revisión de prueba'}});
  const payment=(await request(`/applications/${id}`,{cookie:admin})).data.payments[0];
  await request(`/applications/${id}/payments/${payment.id}/review`,{method:'POST',cookie:admin,body:{status:'accepted',comment:'Validación de prueba'}});
  if(c.id==='operador'){
   await request(`/applications/${id}/documents/${app.documents[0].id}/review`,{method:'POST',cookie:admin,body:{status:'rejected',comment:'Falta la firma del representante.'}});
   await request(`/applications/${id}/status`,{method:'POST',cookie:admin,body:{status:'correction',comment:'Por favor, incorporar la firma requerida.'}});
   await request(`/applications/${id}/submit`,{method:'POST',cookie:owner,body:{declaration:true},status:422});
   const form=new FormData();form.append('file',new Blob([fixture],{type:'application/pdf'}),'corregido.pdf');await request(`/applications/${id}/documents/${c.requirements[0].id}`,{method:'POST',cookie:owner,body:form});
   await request(`/applications/${id}/submit`,{method:'POST',cookie:owner,body:{declaration:true}});
   await request(`/applications/${id}/status`,{method:'POST',cookie:admin,body:{status:'review'}});
   await request(`/applications/${id}/documents/${app.documents[0].id}/review`,{method:'POST',cookie:admin,body:{status:'accepted',comment:'Corregido.'}});
  }
  await request(`/applications/${id}/status`,{method:'POST',cookie:admin,body:{status:'approved'}});
  assert.equal((await request(`/applications/${id}`,{cookie:owner})).data.application.status,'approved');
 }
 const badId=(await request('/applications',{method:'POST',cookie:owner,status:201,body:{category:'centro'}})).data.id;
 const badForm=new FormData();badForm.append('file',new Blob(['<script>alert(1)</script>'],{type:'application/pdf'}),'fake.pdf');await request(`/applications/${badId}/documents/centro-01`,{method:'POST',cookie:owner,body:badForm,status:400});
 await request('/applications',{method:'POST',cookie:owner,body:{category:'centro'},headers:{Origin:'https://untrusted.example'},status:403});
 const stop=new Promise(resolve=>backend.once('exit',resolve));backend.kill();await stop;backend=await start(['server/index.mjs'],'Portal API ready');
 assert.equal((await request(`/applications/${firstId}`,{cookie:owner})).data.application.documents.length,18,'Data and session survive restart');
 await start(['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4174','--strictPort'],'4174');
 browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4174/portal');await page.getByRole('heading',{name:'Bienvenido de nuevo'}).waitFor();await page.screenshot({path:'artifacts/portal-login.png',fullPage:true});
 await page.getByRole('button',{name:'Crear cuenta',exact:true}).click();await page.getByLabel('Nombre completo').fill('Registro desde navegador');await page.getByLabel('Correo electrónico',{exact:false}).fill('browser@example.test');await page.getByLabel('Contraseña',{exact:false}).first().fill(password);await page.getByLabel('Confirmar contraseña').fill(password);await page.locator('[name=consent]').check();await page.getByRole('button',{name:'Crear mi cuenta'}).click();await page.getByRole('heading',{name:'Hola, Registro.'}).waitFor();
 await page.getByRole('button',{name:'Iniciar un registro'}).click();await page.locator('[data-create="centro"]').click();await page.getByRole('heading',{name:'Datos del solicitante'}).waitFor();
 for(const name of ['legalName','rif','phone','municipality','address','representative','identity','representativeEmail','latitude','longitude'])await page.locator(`[name="${name}"]`).fill(details[name]);
 await page.locator('[name=personType]').selectOption('juridica');await page.getByRole('button',{name:'Guardar y continuar'}).click();await page.getByRole('heading',{name:'Expediente documental'}).waitFor();
 await page.locator('.p-document summary').first().click();await page.locator('.p-document').first().locator('input[type=file]').setInputFiles({name:'prueba.pdf',mimeType:'application/pdf',buffer:fixture});await page.getByRole('button',{name:'Guardar recaudo',exact:true}).first().click();await page.getByText('Recaudo guardado en el expediente.',{exact:true}).waitFor();
 await page.screenshot({path:'artifacts/portal-documents.png',fullPage:true});
 await page.getByRole('button',{name:'Volver a expedientes'}).click();await page.getByRole('heading',{name:'Hola, Registro.'}).waitFor();await page.screenshot({path:'artifacts/portal-dashboard.png',fullPage:true});
 await page.locator('[data-action=settings]').first().click();await page.getByRole('heading',{name:'Calculadora de unidades'}).waitFor();await page.locator('[data-calc=units]').fill('20');assert.equal(await page.locator('[data-calc-out=total]').innerText(),'Bs. 2.000,00');await page.locator('[data-calc=bs]').fill('500');assert.equal(await page.locator('[data-calc-out=units]').innerText(),'5 unidades');await page.screenshot({path:'artifacts/portal-calculator.png',fullPage:true});await page.locator('[data-action=dashboard]').first().click();await page.getByRole('heading',{name:'Hola, Registro.'}).waitFor();
 for(const width of [390,768,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Portal overflow ${width}`);}
 await page.setViewportSize({width:390,height:844});await page.locator('.p-application-row').first().click();await page.getByRole('heading',{name:'Datos del solicitante'}).waitFor();for(const section of ['documentos','pagos','revision','historial']){await page.locator(`[data-tab="${section}"]`).first().click();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Portal mobile overflow in ${section}`);}
 await page.locator('[data-tab="documentos"]').click();await page.screenshot({path:'artifacts/portal-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Cerrar sesión'}).click();await page.getByRole('heading',{name:'Bienvenido de nuevo'}).waitFor();await page.getByLabel('Correo electrónico').fill('reviewer@example.test');await page.getByLabel('Contraseña').fill(password);await page.getByRole('button',{name:'Ingresar al portal'}).click();await page.getByRole('heading',{name:'Expedientes de registro'}).waitFor();await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'artifacts/portal-management.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS: 73 requirements, all 5 registrations, fees, authentication, ownership, private downloads, upload types, review/corrections/approval, persistence after restart, and desktop/mobile browser flows.');
}catch(error){if(browser){const pages=browser.contexts().flatMap(c=>c.pages());if(pages[0]){console.log((await pages[0].locator('body').innerText()).slice(0,6000));await pages[0].screenshot({path:'artifacts/portal-error.png',fullPage:true});}}throw error;}finally{await browser?.close();for(const child of children)child.kill();}
