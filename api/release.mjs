import { latestRelease, publicRelease } from '../lib/release.mjs';
export default async function handler(req,res) {
  if (!['GET','HEAD'].includes(req.method)) return res.status(405).end();
  try { const release = publicRelease(await latestRelease()); res.setHeader('Cache-Control','public, max-age=0, s-maxage=60'); return res.status(200).json(release); }
  catch {res.setHeader('Cache-Control','no-store');return res.status(503).json({error:'최신 버전을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.'});}
}
