import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { latestRelease } from '../lib/release.mjs';
import { recordDownload } from '../lib/stats.mjs';
export default async function handler(req,res) {
  if (!['GET','HEAD'].includes(req.method)) return res.status(405).end();
  try {
    const release = await latestRelease();
    const upstream = await fetch(release.url,{method:req.method,signal:AbortSignal.timeout(240000)});
    if (!upstream.ok || (req.method !== 'HEAD' && !upstream.body)) throw new Error('Download unavailable');
    res.statusCode = 200;
    res.setHeader('Content-Type','application/octet-stream');
    res.setHeader('Content-Disposition',`attachment; filename="${release.name}"`);
    res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Content-Type-Options','nosniff');
    if (req.method === 'HEAD') return res.end();
    await recordDownload().catch(()=>{});
    res.flushHeaders();
    await pipeline(Readable.fromWeb(upstream.body),res);
  } catch {if(res.headersSent) res.destroy(); else {res.setHeader('Cache-Control','no-store');res.status(503).send('설치 파일을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.');}}
}
