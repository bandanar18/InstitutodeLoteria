import express from 'express';
import { resolve } from 'node:path';
import { api } from './api.mjs';
const app=express();
app.disable('x-powered-by');
// Detrás de Nginx en el mismo servidor: confiar en X-Forwarded-Proto para cookies Secure.
app.set('trust proxy','loopback');
app.use('/api',api);
app.use(express.static(resolve('dist')));
app.get('/{*path}',(_req,res)=>res.sendFile(resolve('dist/index.html')));
const port=Number(process.env.PORT||3001);
app.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`Portal API ready: http://127.0.0.1:${port}`));
