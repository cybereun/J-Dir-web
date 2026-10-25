import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import release from '../api/release.mjs';
import download from '../api/download.mjs';
import stats from '../api/stats.mjs';
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.wav':'audio/wav','.webm':'video/webm','.mp4':'video/mp4','.pdf':'application/pdf'};
http.createServer(async(req,res)=>{res.status=n=>{res.statusCode=n;return res};res.json=v=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(v))};res.send=v=>res.end(v);const url=new URL(req.url,'http://localhost');if(url.pathname==='/api/stats'){if(req.method==='POST'){let body='';for await(const chunk of req){body+=chunk;if(body.length>1024){res.statusCode=413;return res.end()}}try{req.body=JSON.parse(body)}catch{req.body={}}}return stats(req,res)}if(url.pathname==='/api/release') return release(req,res);if(url.pathname==='/api/download') return download(req,res);try{const file=path.resolve('public','.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));if(!file.startsWith(path.resolve('public')+path.sep))throw 0; const data=await readFile(file);res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end('Not found')}}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
