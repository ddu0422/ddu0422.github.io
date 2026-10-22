import fs from 'node:fs';
import path from 'node:path';
import { loadPosts } from '../src/lib/content/loader';
import { execFileSync } from 'node:child_process';
loadPosts();
// A fresh source-only handoff. Never copy parent files or any Git database.
const roots = ['src','content','scripts','tests','docs','.github','public'];
const files = ['package.json','pnpm-lock.yaml','tsconfig.json','next.config.ts','next-env.d.ts','postcss.config.mjs','.gitignore','README.md','pnpm-workspace.yaml'];
const destination = path.resolve('dist/public-source');
const allowed = new Set(['.ts','.tsx','.mjs','.md','.mdx','.json','.yaml','.yml','.css','.py','.txt','.svg','.png','.jpg','.gif','.webp','.woff2']);
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\bsk-[A-Za-z0-9_-]{30,}\b/,
  /https?:\/\/(?:[^\s/]+\.)?(?:internal|corp|local)(?:[/:\s]|$)/i,
];
function check(file: string) {
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink()) throw new Error(`Symlink forbidden in public source: ${file}`);
  if (stat.isDirectory()) { for (const child of fs.readdirSync(file)) check(path.join(file,child)); return; }
  if (!allowed.has(path.extname(file)) && path.basename(file) !== '.gitignore') throw new Error(`Unapproved public file type: ${file}`);
  if (/(?:backup|private|secret|\.env|\.git\/)/i.test(file)) throw new Error(`Review filename before export: ${file}`);
  if (!['.png','.jpg','.gif','.webp','.woff2'].includes(path.extname(file))) {
    const body = fs.readFileSync(file,'utf8');
    if (secretPatterns.some(pattern => pattern.test(body))) throw new Error(`Possible confidential data: ${file}; inspect locally`);
  }
}
for (const item of [...roots,...files]) if (fs.existsSync(item)) check(item);
fs.rmSync(destination,{ recursive:true, force:true });
fs.mkdirSync(destination,{ recursive:true });
for (const item of [...roots,...files]) if (fs.existsSync(item)) fs.cpSync(item,path.join(destination,item),{ recursive:true });
// macOS tar otherwise emits AppleDouble metadata alongside reviewed source files.
execFileSync('tar',['-czf',path.resolve('dist/public-source.tar.gz'),'-C',destination,'.'],{env:{...process.env,COPYFILE_DISABLE:'1'}});
console.log('Source-only package created. No Git history, build output, PDF, private parent files or dependency cache copied. ');
