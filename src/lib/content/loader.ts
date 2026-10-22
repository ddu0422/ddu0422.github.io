import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {postSchema} from './schema';
import {postTimestamp} from '../date';
export type Post=ReturnType<typeof postSchema.parse>&{slug:string;href:string;body:string};
export function proseOutsideCode(body:string){
 let fence:string|undefined;const lines:string[]=[];
 for(const line of body.split('\n')){
  const match=line.match(/^\s*(`{3,}|~{3,})/);
  if(match){if(!fence)fence=match[1];else if(match[1][0]===fence[0]&&match[1].length>=fence.length)fence=undefined;continue;}
  if(!fence)lines.push(line);
 }
 return lines.join('\n');
}
export function sortPosts<T extends {publishedAt?:string;slug:string}>(posts:T[]){return posts.sort((a,b)=>{
 const difference=(b.publishedAt?postTimestamp(b.publishedAt):-Infinity)-(a.publishedAt?postTimestamp(a.publishedAt):-Infinity);
 return difference||(a.slug<b.slug?-1:a.slug>b.slug?1:0);
})}
export function loadPosts(root=process.cwd()):Post[]{
 const folder=path.join(root,'content/posts');
 if(fs.lstatSync(folder).isSymbolicLink())throw Error('Symlink content folder is forbidden');
 const posts=fs.readdirSync(folder).sort().map(file=>{
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*\.mdx$/.test(file))throw Error('Unexpected post filename');
  const target=path.join(folder,file);if(fs.lstatSync(target).isSymbolicLink())throw Error('Symlink post is forbidden');
  const {data,content}=matter(fs.readFileSync(target,'utf8'));const post=postSchema.parse(data);
  const prose=proseOutsideCode(content);
  if(/^(?:import|export)\s/m.test(prose)||/\b(?:dangerouslySetInnerHTML|onClick|onLoad|javascript:)\b/i.test(prose))throw Error('Unsafe MDX construct');
  const slug=file.slice(0,-4);return {...post,slug,href:`/posts/${slug}/`,body:content};
 });
 return sortPosts(posts);
}
export function published(){return loadPosts().filter(p=>p.status==='Published');}
