/**
 * Aggregate only voluntarily collected, anonymous observation codes.
 * No telemetry, network calls or generated participant data.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const columns = ['participant_id','device','task_id','completion','interpretation','seconds','friction'];
const devices = new Set(['desktop','mobile']);
const tasks = ['T1','T2','T3','T4','T5','T6'];
const completions = new Set(['independent','hinted','unsuccessful','skipped']);
const interpretations = new Set(['correct','partial','incorrect','not_assessed']);
const frictions = ['none','discovery','navigation','terminology','encoding','denominator','accessibility','performance','other'];

export function parseStudyTsv(source) {
  if (typeof source !== 'string') throw new Error('Expected UTF-8 TSV text');
  const lines = source.replace(/^\uFEFF/,'').split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines[0] !== columns.join('\t')) throw new Error('Incorrect evaluation TSV header');
  const seen = new Set();
  const participantDevices = new Map();
  return lines.slice(1).map((line, index) => {
    const fields = line.split('\t');
    if (fields.length !== columns.length) throw new Error('Row ' + (index+2) + ': expected 7 tab-delimited columns');
    const row = Object.fromEntries(columns.map((key, i) => [key, fields[i].trim()]));
    if (!/^P(?:0[1-9]|[1-9][0-9])$/.test(row.participant_id)) throw new Error('Row ' + (index+2) + ': anonymized participant_id required, e.g. P01');
    if (!devices.has(row.device)) throw new Error('Row ' + (index+2) + ': unsupported device');
    if (!tasks.includes(row.task_id)) throw new Error('Row ' + (index+2) + ': unknown task');
    if (!completions.has(row.completion)) throw new Error('Row ' + (index+2) + ': invalid completion');
    if (!interpretations.has(row.interpretation)) throw new Error('Row ' + (index+2) + ': invalid interpretation');
    if (!frictions.includes(row.friction)) throw new Error('Row ' + (index+2) + ': invalid friction category');
    if (row.completion === 'skipped') {
      if (row.seconds !== '' || row.interpretation !== 'not_assessed') throw new Error('Row ' + (index+2) + ': skipped tasks must have no time or interpretation');
    } else if (!/^\d+$/.test(row.seconds) || +row.seconds > 3600) {
      throw new Error('Row ' + (index+2) + ': attempted tasks need integer seconds between 0 and 3600');
    }
    const key = row.participant_id + '/' + row.task_id;
    if (seen.has(key)) throw new Error('Row ' + (index+2) + ': duplicate participant/task');
    seen.add(key);
    if (participantDevices.has(row.participant_id) && participantDevices.get(row.participant_id) !== row.device) {
      throw new Error('Row ' + (index+2) + ': conflicting device for the same session');
    }
    participantDevices.set(row.participant_id,row.device);
    return { ...row, seconds: row.seconds === '' ? null : Number(row.seconds) };
  });
}

function median(values) {
  if (!values.length) return null;
  const ordered = [...values].sort((a,b)=>a-b);
  const k = ordered.length >> 1;
  return ordered.length % 2 ? ordered[k] : (ordered[k-1]+ordered[k])/2;
}

export function summarizeStudy(rows) {
  if (!Array.isArray(rows)) throw new Error('Expected validated study rows');
  const attempted = rows.filter(row => row.completion !== 'skipped');
  const participants = new Set(rows.map(row => row.participant_id)).size;
  const independent = attempted.filter(row=>row.completion === 'independent').length;
  const understood = attempted.filter(row=>row.interpretation === 'correct').length;
  const categories = Object.fromEntries(frictions.map(name=>[name,attempted.filter(row=>row.friction===name).length]));
  return {
    status: attempted.length ? 'OBSERVED DATA (unreviewed)' : 'NOT CONDUCTED',
    participants, entries:rows.length, attempted:attempted.length, skipped:rows.length-attempted.length,
    independent, understood, medianSeconds:median(attempted.map(row=>row.seconds)),
    byTask: tasks.map(task=>{
      const list = attempted.filter(row=>row.task_id===task);
      return {
        task, attempted:list.length, independent:list.filter(row=>row.completion==='independent').length,
        interpreted:list.filter(row=>row.interpretation==='correct').length,
        medianSeconds:median(list.map(row=>row.seconds))
      };
    }),
    categories
  };
}

const fmt = number => number === null ? '—' : String(number);
export function formatStudyReport(result) {
  const out = [
    '# Visualization study — descriptive report',
    '',
    '**Status: ' + result.status + '**',
    '',
    '- Consenting anonymous sessions with worksheet entries: **' + result.participants + '**',
    '- Recorded task rows: **' + result.entries + '** (' + result.attempted + ' attempted; ' + result.skipped + ' skipped)',
    '- Independent task completion: **' + result.independent + '/' + result.attempted + '**',
    '- Correct comprehension: **' + result.understood + '/' + result.attempted + '**',
    '- Median attempted-task time: **' + fmt(result.medianSeconds) + ' s**',
    '',
    '| Task | Attempted | Independent | Correct interpretation | Median seconds |',
    '|---|---:|---:|---:|---:|'
  ];
  for (const v of result.byTask) out.push('| ' + v.task + ' | ' + v.attempted + ' | ' + v.independent + '/' + v.attempted + ' | ' + v.interpreted + '/' + v.attempted + ' | ' + fmt(v.medianSeconds) + ' |');
  out.push('','Primary observed friction (attempted tasks only): '+Object.entries(result.categories).filter(([k,n])=>k!=='none'&&n>0).map(([k,n])=>k+' '+n).join('; ').replace(/^$/,'none recorded'));
  out.push('','> Descriptive counts from supplied records only. A small self-selected sample cannot establish population-level comprehension or prove an intervention helped. Automated tests and synthetic unit-test fixtures are not human sessions.');
  if (result.attempted === 0) out.push('','**No actual task outcomes have been entered; do not present this as an evaluation result.**');
  return out.join('\n')+'\n';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const path = process.argv[2];
  if (!path) {
    console.error('Usage: node scripts/evaluate-study.mjs <private-observations.tsv>');
    process.exitCode = 2;
  } else {
    try { process.stdout.write(formatStudyReport(summarizeStudy(parseStudyTsv(readFileSync(path,'utf8'))))); }
    catch (error) { console.error('Study input rejected: ' + error.message); process.exitCode = 2; }
  }
}
