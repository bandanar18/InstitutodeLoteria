import { readFile, writeFile } from 'node:fs/promises';
const source = await readFile('public/assets/original.js', 'utf8');
const css=await readFile('public/assets/original.css','utf8');
const assets = [...new Set([...source.matchAll(/(?:src|image):`(\/[^`]+)`/g)].map(m => m[1]).concat([...css.matchAll(/url\((\/[^)]+)\)/g)].map(m=>m[1])))];
await Promise.all(assets.map(async path => {
  const response = await fetch(`https://instituto-merida-demo.netlify.app${path}`);
  if (!response.ok || response.headers.get('content-type')?.includes('text/html')) throw Error(`Missing image: ${path}`);
  await writeFile(`public${path}`, Buffer.from(await response.arrayBuffer()));
  console.log(`Downloaded ${path}`);
}));
