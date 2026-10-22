import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {postSchema} from '../src/lib/content/schema';
import {loadPosts,sortPosts} from '../src/lib/content/loader';
const base={title:'Title',description:'Description',category:'백엔드',tags:['JPA'],status:'Published',publishedAt:'2026-10-20'};
test('Post frontmatter accepts technical fields and rejects career metadata',()=>{assert.equal(postSchema.parse(base).title,'Title');for(const field of ['company','organization','role','period','sourcePage','story'])assert.throws(()=>postSchema.parse({...base,[field]:'example'}));assert.throws(()=>postSchema.parse({...base,topic:'missing'}))});
test('Published posts have dates and local routes without manual order',()=>{const posts=loadPosts();assert.ok(posts.length>0);for(const p of posts){assert.match(p.href,/^\/posts\/[a-z0-9-]+\/$/);assert.equal('order' in p,false);assert.ok(p.publishedAt);assert.equal(p.status,'Published');assert.ok(p.body.trim());if(p.sourceUrl){assert.match(p.sourceUrl,/^https:\/\/dhistory\.tistory\.com\/\d+$/);assert.ok(p.publishedAt);assert.ok(p.sourceCategory)}}});
test('Executable MDX and symlink posts are rejected',()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'blog-content-'));const folder=path.join(root,'content/posts');fs.mkdirSync(folder,{recursive:true});const target=path.join(folder,'example.mdx');try{fs.writeFileSync(target,'---\ntitle: Test\ndescription: Test\ncategory: 백엔드\ntags: [JPA]\nstatus: Published\npublishedAt: "2026-10-20"\n---\nimport x from "x"');assert.throws(()=>loadPosts(root),/Unsafe MDX/);fs.unlinkSync(target);fs.symlinkSync('/tmp/missing-blog-example',target);assert.throws(()=>loadPosts(root),/Symlink/)}finally{fs.rmSync(root,{recursive:true,force:true})}});

test('Publication dates sort newest first with deterministic ties and undated drafts last',()=>{
 const posts=[{slug:'draft'},{slug:'old',publishedAt:'2024-01-01T09:00:00+09:00'},{slug:'b',publishedAt:'2026-10-20'},{slug:'latest',publishedAt:'2026-10-20T01:00:00+09:00'},{slug:'a',publishedAt:'2026-10-19T15:00:00Z'}];
 assert.deepEqual(sortPosts([...posts]).map(p=>p.slug),['latest','a','b','old','draft']);
 assert.deepEqual(sortPosts([...posts].reverse()).map(p=>p.slug),['latest','a','b','old','draft']);
});
test('Published dates are required; drafts can omit them and manual order is rejected',()=>{
 const {publishedAt,...undated}=base;assert.throws(()=>postSchema.parse(undated));assert.doesNotThrow(()=>postSchema.parse({...undated,status:'Draft'}));assert.throws(()=>postSchema.parse({...base,order:1}));assert.throws(()=>postSchema.parse({...base,publishedAt:'2026-02-30'}));
});
test('Code examples may contain import statements without enabling MDX imports',()=>{
 const posts=loadPosts();const kotlin=posts.find(p=>p.slug==='tistory-3');assert.ok(kotlin);assert.match(kotlin.body,/```/);assert.ok(posts.some(p=>p.body.includes('import ')));
});
test('Imported sources exclude coding-test categories and preserve local article images',()=>{
 const manifest=JSON.parse(fs.readFileSync('content/tistory-migration.json','utf8'));const posts=loadPosts();const imports=posts.filter(p=>p.sourceUrl);assert.equal(imports.length,manifest.imported.length);assert.equal(new Set(imports.map(p=>p.sourceUrl)).size,imports.length);
 for(const record of manifest.imported){assert.ok(!/Computer Science\/Algorithm/i.test(record.sourceCategory));assert.ok(!/Baekjoon|Programmers Level/i.test(record.title));const post=imports.find(p=>p.sourceUrl===record.sourceUrl);assert.ok(post);assert.equal(post.publishedAt,record.publishedAt);assert.equal(post.sourceCategory,record.sourceCategory)}
 for(const post of imports)for(const match of post.body.matchAll(/!\[[^\]]*\]\((\/images\/tistory\/[^)]+)\)/g)){assert.ok(fs.existsSync(path.join('public',match[1])))}
});

test('Source title prefixes become searchable tags without changing article identity',()=>{
 const manifest=JSON.parse(fs.readFileSync('content/tistory-migration.json','utf8'));const posts=loadPosts();
 for(const record of manifest.imported){const post=posts.find(p=>p.sourceUrl===record.sourceUrl)!;let title=record.title;const prefixes:string[]=[];while(/^\s*\[([^\]]+)\]\s*/.test(title)){title=title.replace(/^\s*\[([^\]]+)\]\s*/,(_:string,tag:string)=>{prefixes.push(tag.trim());return ''})}assert.equal(post.title,title);for(const tag of prefixes)assert.ok(post.tags.some(t=>t.toLowerCase()===tag.toLowerCase()),`${post.slug}: missing ${tag}`);assert.equal(post.category,record.category)}
});
