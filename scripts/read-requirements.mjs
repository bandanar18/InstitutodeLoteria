import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createCanvas } from '@napi-rs/canvas';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
const source=process.argv[2];
const pdf=await getDocument({data:new Uint8Array(await readFile(source)),useSystemFonts:true}).promise;
await mkdir('tmp/pdfs',{recursive:true});
let text='';
for(let n=1;n<=pdf.numPages;n++){
 const page=await pdf.getPage(n);
 const content=await page.getTextContent();
 const pageText=content.items.map(i=>i.str+(i.hasEOL?'\n':' ')).join('');
 text+=`\n--- PAGE ${n} ---\n${pageText}\n`;
 const viewport=page.getViewport({scale:1.5});
 const canvas=createCanvas(Math.ceil(viewport.width),Math.ceil(viewport.height));
 await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
 await writeFile(`tmp/pdfs/page-${n}.png`,canvas.toBuffer('image/png'));
}
await writeFile('tmp/pdfs/requirements.txt',text);
console.log(text);
