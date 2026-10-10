#!/usr/bin/env node
/**
 * Validate every GIF embedded in source README files.
 * Parse GIF data blocks rather than counting raw 0x2c bytes (which can also
 * occur inside compressed pixels), so a single-frame placeholder cannot pass.
 */
import {readFileSync, statSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const docs=['README.md','extension/README.md'];
const sourceName='docs/demos/google-maps-extension-demo.gif';

function skipBlocks(buffer,position){
  while(position<buffer.length){
    const size=buffer[position++];
    if(size===0)return position;
    if(position+size>buffer.length)throw new Error('Truncated GIF subblock');
    position+=size;
  }
  throw new Error('Missing GIF subblock terminator');
}

export function inspectGif(buffer){
  assert.ok(Buffer.isBuffer(buffer),'Expected GIF file bytes');
  assert.ok(buffer.length>=20,'GIF is too short');
  assert.equal(buffer.subarray(0,6).toString('ascii'),'GIF89a','Expected animated GIF89a header');
  const width=buffer.readUInt16LE(6),height=buffer.readUInt16LE(8);
  assert.ok(width>=180&&height>=130&&width<=4000&&height<=4000,'Invalid GIF dimensions');
  let position=13;
  const packed=buffer[10];
  if(packed&0x80)position+=3*(2**((packed&7)+1));
  let frames=0,seconds=0,delayCs=0,terminated=false;
  while(position<buffer.length){
    const marker=buffer[position++];
    if(marker===0x3b){terminated=true;break;}
    if(marker===0x21){
      assert.ok(position<buffer.length,'Truncated GIF extension');
      const label=buffer[position++];
      if(label===0xf9){
        assert.equal(buffer[position],4,'Unexpected graphic control extension size');
        delayCs=buffer.readUInt16LE(position+2);
      }
      position=skipBlocks(buffer,position);
      continue;
    }
    if(marker===0x2c){
      assert.ok(position+9<=buffer.length,'Truncated GIF image descriptor');
      const flags=buffer[position+8];
      position+=9;
      if(flags&0x80)position+=3*(2**((flags&7)+1));
      assert.ok(position<buffer.length,'Missing GIF LZW code size');
      position++; // LZW minimum code size
      position=skipBlocks(buffer,position);
      frames++;
      seconds+=delayCs/100;
      delayCs=0;
      continue;
    }
    throw new Error('Invalid GIF block marker 0x'+marker.toString(16));
  }
  assert.ok(terminated,'GIF is missing its trailer');
  assert.ok(frames>=2,'GIF contains fewer than two image frames');
  assert.ok(seconds>0,'GIF lacks a playable animation duration');
  return {width,height,frames,seconds:Number(seconds.toFixed(2)),bytes:buffer.length};
}

function readReferences(file){
  const src=readFileSync(resolve(root,file),'utf8');
  const links=[...src.matchAll(/!\[[^\]]*\]\(([^)#?]+\.gif)\)/gi)].map(m=>m[1]);
  assert.ok(links.length>0,file+' is missing demo GIF embeds');
  for(const link of links){
    assert.ok(link.startsWith('../docs/demos/')||link.startsWith('docs/demos/'),
      file+': unexpected GIF location '+link);
    assert.ok(!link.includes('..')||link.startsWith('../docs/demos/'),
      'Unexpected relative traversal in README GIF: '+link);
  }
  return links.map(link=>resolve(root,dirname(file),link));
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  let verified=0;
  for(const doc of docs){
    const links=readReferences(doc);
    const extension=resolve(root,sourceName);
    assert.ok(links.includes(extension),doc+' must embed the actual Google Maps extension demo');
    for(const path of links){
      assert.ok(statSync(path).isFile(),'Missing README GIF '+path);
      const details=inspectGif(readFileSync(path));
      if(path===extension){
        assert.ok(details.frames>=8,'Extension demo must show multiple actual interaction states');
        assert.ok(details.seconds>=6,'Extension demo is too short to understand');
        assert.ok(details.bytes<=18_000_000,'Extension GIF is too large for GitHub README');
      }
      console.log(doc+': '+path.slice(root.length+1)+' | '+details.frames+
        ' frames, '+details.seconds+' s, '+details.width+'x'+details.height);
      verified++;
    }
  }
  console.log('PASS: '+verified+' README GIF embeddings are present and animated.');
}
