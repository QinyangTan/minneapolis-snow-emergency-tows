import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseStudyTsv, summarizeStudy, formatStudyReport } from '../scripts/evaluate-study.mjs';

const header='participant_id\tdevice\ttask_id\tcompletion\tinterpretation\tseconds\tfriction\n';
// THESE ARE SYNTHETIC VALIDATION FIXTURES, NOT ACTUAL HUMAN STUDY RESULTS.
const synthetic=header+[
  'P01\tdesktop\tT1\tindependent\tcorrect\t31\tnone',
  'P01\tdesktop\tT2\thinted\tpartial\t64\tdiscovery',
  'P02\tmobile\tT1\tunsuccessful\tincorrect\t102\tencoding',
  'P02\tmobile\tT3\tskipped\tnot_assessed\t\tnone'
].join('\n')+'\n';

test('blank worksheet explicitly reports NOT CONDUCTED without inventing participants',()=>{
  const text=readFileSync(new URL('../docs/evaluation/evaluation-template.tsv',import.meta.url),'utf8');
  const r=summarizeStudy(parseStudyTsv(text));
  assert.equal(r.status,'NOT CONDUCTED');
  assert.equal(r.participants,0);
  assert.equal(r.entries,0);
  assert.match(formatStudyReport(r),/No actual task outcomes/);
});

test('synthetic fixtures exercise accurate numerator/denominator aggregation',()=>{
  const r=summarizeStudy(parseStudyTsv(synthetic));
  assert.equal(r.participants,2);
  assert.equal(r.attempted,3);
  assert.equal(r.skipped,1);
  assert.equal(r.independent,1);
  assert.equal(r.understood,1);
  assert.equal(r.medianSeconds,64);
  assert.equal(r.byTask[0].medianSeconds,66.5);
  assert.equal(r.byTask[2].attempted,0);
  assert.equal(r.categories.discovery,1);
  assert.match(formatStudyReport(r),/1\/3/);
});

test('validation rejects duplicate tasks, personal identifiers, malformed tabs, fake times',()=>{
  assert.throws(()=>parseStudyTsv('hello'),/header/);
  assert.throws(()=>parseStudyTsv(header+'Qinyang\tdesktop\tT1\tindependent\tcorrect\t10\tnone'),/anonymized/);
  assert.throws(()=>parseStudyTsv(header+'P01\tdesktop\tT1\tindependent\tcorrect\t3.5\tnone'),/integer seconds/);
  assert.throws(()=>parseStudyTsv(header+'P01\tdesktop\tT1\tindependent\tcorrect\t20\tnone\nP01\tdesktop\tT1\thinted\tpartial\t21\tnone'),/duplicate/);
  assert.throws(()=>parseStudyTsv(header+'P01\tdesktop\tT1\tskipped\tcorrect\t\tnone'),/skipped tasks/);
  assert.throws(()=>parseStudyTsv(header+'P01\tdesktop\tT1\tskipped\tnot_assessed\t\tsevere issue'),/friction/);
  assert.throws(()=>parseStudyTsv(header+'P01\tdesktop\tT1\tindependent\tcorrect\t12\tnone\nP01\tmobile\tT2\tindependent\tcorrect\t12\tnone'),/conflicting device/);
});
