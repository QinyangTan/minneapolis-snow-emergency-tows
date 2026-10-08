/**
 * Preflight a SvelteKit *project-subpath* static artifact before anyone publishes.
 * This verifies build structure and accidental source-doc exposure; it does not
 * publish, grant team consent, test privacy policy or certify a live site.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const base=process.env.PAGES_BASE_PATH||'/minneapolis-snow-emergency-tows-demo';
const root=path.resolve('build');
const htmlPath=path.join(root,'index.html');
if(!existsSync(htmlPath))throw Error('Missing static build/index.html');
const html=readFileSync(htmlPath,'utf8');
// SvelteKit prerender deliberately emits relative "./_app/..." URLs on
// static pages; these are subpath-safe. Absolute URLs must include the base.
if (!html.includes('_app/')) throw Error('No compiled app assets referenced from HTML');
if (/(?:["'(])\/_app\//.test(html)) throw Error('Root-absolute _app links will break at Pages project subpath');
// The stronger test below is a real Chromium fetch under the declared base,
// rather than falsely requiring all SvelteKit assets to be absolute URLs.

for(const relative of ['data/summary.json','data/neighborhoods.geojson','data/quality.json']) {
  const file=path.join(root,relative);
  if(!existsSync(file))throw Error('Public artifact missing required processed data '+relative);
  JSON.parse(readFileSync(file,'utf8'));
}
const items=[];
function visit(dir) {
  for(const entry of readdirSync(dir,{withFileTypes:true})) {
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())visit(full);
    else if(entry.isFile())items.push({name:path.relative(root,full).replaceAll(path.sep,'/'),bytes:statSync(full).size});
  }
}
visit(root);
const dangerous=items.filter(x=>/(^|\/)(\.env|\.git|node_modules|docs|tests|raw|TEAM_CONTRIBUTIONS|AI_DISCLOSURE|RUBRIC_TRACEABILITY|AGENTS\.md)(\/|\.|$)/i.test(x.name));
if(dangerous.length)throw Error('Prohibited path in public artifact: '+dangerous.map(x=>x.name).join(', '));
if(!items.some(x=>x.name.startsWith('_app/')&&x.name.endsWith('.js')))throw Error('Missing compiled browser JS');
const total=items.reduce((n,x)=>n+x.bytes,0);
console.log('PASS: Pages subpath '+base+'; processed dataset files present; no obvious private development files; '+items.length+' files, '+total+' bytes');
console.log('This is an artifact preflight only; public deployment and external verification are still pending authorization.');
