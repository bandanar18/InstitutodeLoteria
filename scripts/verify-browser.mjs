import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','4173'],{stdio:'pipe'});
let browser;
try {
 await new Promise((resolve,reject)=>{server.stdout.on('data',data=>{if(data.toString().includes('4173'))resolve();});server.on('error',reject);server.on('exit',code=>reject(Error(`Server exited: ${code}`)));});
 browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('.hb-right img').waitFor();
 await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('.game-card').count(),6);
 await page.locator('.game-card').first().click();
 assert(await page.locator('dialog').evaluate(el=>el.open));
 await page.keyboard.press('Escape');
 assert(!(await page.locator('dialog').evaluate(el=>el.open)));
 await page.evaluate(async()=>{document.activeElement.blur();for(let y=0;y<document.body.scrollHeight;y+=700){window.scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,80));}window.scrollTo({top:0,behavior:'instant'});});
 await page.waitForTimeout(700);
 await mkdir('artifacts',{recursive:true});
 await page.screenshot({path:'artifacts/home-desktop.png',fullPage:true});
 for(const width of [390,768,1440]){
  await page.setViewportSize({width,height:900});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}px`);
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator('.menu-toggle').click();
 assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');
 await page.locator('#navigation a[href="/instituto"]').click();
 await page.locator('#root h1').waitFor();
 assert.equal(await page.locator('#root h1').textContent(),'El Instituto');
 await page.screenshot({path:'artifacts/interior-mobile.png',fullPage:true});
 for(const route of ['/beneficencia','/loteria','/tramites','/transparencia','/normativa','/noticias','/contacto','/portal','/beneficencia/solicitar','/beneficencia/consultar','/loteria/resultados','/loteria/operadores']){
  await page.goto(`http://127.0.0.1:4173${route}`);
  await page.locator('#root h1').waitFor();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow on ${route}`);
  await page.locator('.menu-toggle').click();
  const menuLayout=await page.locator('#navigation').evaluate(nav=>{
   const bounds=nav.getBoundingClientRect();
   return {width:bounds.width,viewport:innerWidth,coveredLinks:[...nav.querySelectorAll('a')].filter(link=>{
    const r=link.getBoundingClientRect();
    return !link.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2));
   }).map(link=>link.textContent)};
  });
  assert.deepEqual(menuLayout.coveredLinks,[],`Menu links covered on ${route}`);
  assert.equal(Math.round(menuLayout.width),menuLayout.viewport,`Menu width on ${route}`);
  if(route==='/beneficencia')await page.screenshot({path:'artifacts/interior-menu-mobile.png'});
  await page.keyboard.press('Escape');
 }
 await page.goto('http://127.0.0.1:4173/contacto');
 await page.locator('.demo-form-notice').waitFor();
 await page.locator('form').evaluate(el=>el.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
 assert(await page.locator('dialog').evaluate(el=>el.open));
 await page.goto('http://127.0.0.1:4173/');
 await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=700){window.scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,80));}window.scrollTo({top:0,behavior:'instant'});});
 await page.waitForTimeout(700);
 await page.screenshot({path:'artifacts/home-mobile.png',fullPage:true});
 assert.deepEqual(errors,[],'Browser runtime errors');
 console.log('Verified desktop/mobile layout, 13 inner routes, menu, game dialogs, and honest form states. No browser errors.');
} finally {await browser?.close();server.kill();}
