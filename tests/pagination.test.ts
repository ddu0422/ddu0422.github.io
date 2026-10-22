import {test} from 'node:test';
import assert from 'node:assert/strict';
import {paginate} from '../src/lib/pagination';
test('21 posts are displayed in pages of 10, 10 and 1 without overlap',()=>{
 const posts=Array.from({length:21},(_,i)=>i+1);const first=paginate(posts,1),middle=paginate(posts,2),last=paginate(posts,3);
 assert.deepEqual(first.items,[1,2,3,4,5,6,7,8,9,10]);assert.deepEqual(middle.items,[11,12,13,14,15,16,17,18,19,20]);assert.deepEqual(last.items,[21]);assert.equal(last.totalPages,3);assert.deepEqual([last.start,last.end],[21,21]);assert.deepEqual([...first.items,...middle.items,...last.items],posts);
});
test('Empty, exact-boundary and shortened result sets stay within valid page bounds',()=>{
 assert.deepEqual(paginate([],1).items,[]);assert.deepEqual([paginate([],1).start,paginate([],1).end],[0,0]);assert.equal(paginate(Array(10),1).totalPages,1);assert.equal(paginate(['one'],3).page,1);assert.equal(paginate(['one'],0).page,1);assert.deepEqual(paginate(Array(200),20).numbers,[16,17,18,19,20]);
});
