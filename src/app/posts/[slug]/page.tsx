import Link from 'next/link';
import {notFound} from 'next/navigation';
import {loadPosts} from '@/lib/content/loader';
import {ContentBody} from '@/components/ContentBody';
import {formatPostDate} from '@/lib/date';
import {formatPostTitle} from '@/lib/post-title';
export const dynamicParams=false;
export function generateStaticParams(){return loadPosts().map(p=>({slug:p.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const p=loadPosts().find(p=>p.slug===slug);return {title:p?formatPostTitle(p):undefined,description:p?.description,alternates:{canonical:p?.href},...(p?.status==='Draft'?{robots:{index:false,follow:false}}:{})}}
export default async function PostPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const posts=loadPosts();const post=posts.find(p=>p.slug===slug);if(!post)notFound();const all=posts.filter(p=>p.status==='Published');const index=all.findIndex(p=>p.slug===slug);return <article className="container detail"><header className="detail-header"><h1>{formatPostTitle(post)}</h1><p className="lede">{post.description}</p>{post.publishedAt&&<div className="article-meta">{post.publishedAt&&<time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>}</div>}<div className="tags">{post.tags.map(t=><span key={t}>{t}</span>)}</div></header><ContentBody body={post.body} articleId={post.slug}/>{post.status==='Published'&&<nav className="prev-next" aria-label="이전 및 다음 글">{all[index+1]?<Link className="previous-post" href={all[index+1].href}><span>이전 글</span><strong>{formatPostTitle(all[index+1])}</strong></Link>:<span/>}{all[index-1]&&<Link className="next-post" href={all[index-1].href}><span>다음 글</span><strong>{formatPostTitle(all[index-1])}</strong></Link>}</nav>}</article>}
