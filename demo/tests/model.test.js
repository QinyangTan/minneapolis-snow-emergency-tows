import test from 'node:test';
import assert from 'node:assert/strict';
import { countHeight, summarize, dominantDays, labelCount } from '../src/lib/model.js';

const data={event:{dayTotals:[10,30,20]},neighborhoods:[{id:'a',name:'A',counts:[2,6,0]}]};
test('all days use one linear height scale, zero has zero height',()=>{
  assert.equal(countHeight(0,30,4),0);
  assert.equal(countHeight(15,30,4),2);
  assert.equal(countHeight(30,30,4),4);
  assert.equal(countHeight(null,30,4),null);
});
test('selected summary uses current-day city denominator',()=>{
  const s=summarize(data,'a',2);
  assert.equal(s.count,6);
  assert.equal(s.total,8);
  assert.equal(s.share,20);
  assert.deepEqual(s.peakDays,[2]);
});
test('a tied maximum and a zero neighborhood are explicit',()=>{
  assert.deepEqual(dominantDays([3,3,1]),[1,2]);
  assert.deepEqual(dominantDays([0,0,0]),[]);
});

test('an exact count is suppressed until height and plate positions settle',()=>{
  assert.equal(labelCount(1,4.865,7.2/62,false),null);
  assert.equal(labelCount(1,7.2/62,7.2/62,true),null);
  assert.equal(labelCount(1,7.2/62,7.2/62,false),1);
  assert.equal(labelCount(0,0,0,false),0);
});
