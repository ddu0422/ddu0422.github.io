'use client';
import {useSyncExternalStore} from 'react';
import Link from 'next/link';
import {paginate} from '@/lib/pagination';
import {categoryNames} from '@/lib/site';
import {formatPostDate} from '@/lib/date';
import {formatPostTitle} from '@/lib/post-title';
type Post={slug:string;href:string;title:string;description:string;category:string;tags:string[];featured:boolean;publishedAt?:string};
const filterChange='blog-filters-change';
function subscribeFilters(notify:()=>void){window.addEventListener('popstate',notify);window.addEventListener(filterChange,notify);return ()=>{window.removeEventListener('popstate',notify);window.removeEventListener(filterChange,notify)}}
const getFilterSnapshot=()=>window.location.search;
const getServerFilterSnapshot=()=>'';
export function BlogPosts({items,headingAs='h2'}:{items:Post[];headingAs?:'h1'|'h2'}){
 const search=useSyncExternalStore(subscribeFilters,getFilterSnapshot,getServerFilterSnapshot);
 const params=new URLSearchParams(search);
 const categories=['전체',...new Set([...categoryNames,...items.map(p=>p.category)])];
 const query=params.get('q')||'';const selectedCategory=params.get('category')||'전체';const category=categories.includes(selectedCategory)?selectedCategory:'전체';
 const requestedPage=Number(params.get('page')||1);const page=Number.isSafeInteger(requestedPage)&&requestedPage>0?requestedPage:1;
 const updateFilters=(changes:{category?:string;q?:string;page?:number})=>{
  const url=new URL(window.location.href);for(const [key,value] of Object.entries(changes)){if(value===''||(key==='category'&&value==='전체')||(key==='page'&&value===1))url.searchParams.delete(key);else url.searchParams.set(key,String(value))}
  window.history.replaceState(window.history.state,'',url);window.dispatchEvent(new Event(filterChange));
 };
 const filtered=items.filter(p=>(category==='전체'||p.category===category)&&`${p.title} ${p.description} ${p.category} ${p.tags.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
 const pagination=paginate(filtered,page);const Heading=headingAs;
 const changePage=(next:number)=>{updateFilters({page:next});document.getElementById('posts')?.scrollIntoView({behavior:'smooth',block:'start'})};
 return <section id="posts" className="blog-posts"><div className="blog-list-heading page-heading"><Heading>글 목록 <span>{filtered.length}</span></Heading><label className="blog-search"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/></svg><input aria-label="글 검색" type="search" placeholder="제목, 기술 검색" value={query} onChange={e=>{updateFilters({q:e.target.value,page:1})}}/></label></div>
 <div className="blog-filters" role="group" aria-label="카테고리 선택">{categories.map(name=><button key={name} aria-pressed={category===name} onClick={()=>{updateFilters({category:name,page:1})}}>{name}</button>)}</div>
 <div className="post-list" aria-live="polite">{pagination.items.map(p=><article key={p.slug} className="blog-post">{p.publishedAt&&<div className="post-meta"><time dateTime={p.publishedAt}>{formatPostDate(p.publishedAt)}</time></div>}<h3><Link href={p.href}>{formatPostTitle(p)}</Link></h3><p>{p.description}</p><div className="post-bottom"><div className="post-technologies">{p.tags.map(t=><span key={t}>{t}</span>)}</div></div></article>)}</div>
 {!filtered.length&&<div className="search-empty"><h3>{query.trim()?'검색 결과가 없어요':'아직 등록된 글이 없어요'}</h3><p>{query.trim()?'다른 검색어를 입력해 보세요.':'다른 카테고리를 선택해 보세요.'}</p><button onClick={()=>{updateFilters({q:'',category:'전체',page:1})}}>전체 글 보기</button></div>}
 {filtered.length>0&&<div className="post-pagination"><nav aria-label="글 목록 페이지"><button aria-label="이전 페이지" disabled={pagination.page===1} onClick={()=>changePage(pagination.page-1)}>←</button>{pagination.numbers.map(n=><button key={n} aria-label={`${n}페이지`} aria-current={pagination.page===n?'page':undefined} onClick={()=>changePage(n)}>{n}</button>)}<button aria-label="다음 페이지" disabled={pagination.page===pagination.totalPages} onClick={()=>changePage(pagination.page+1)}>→</button></nav></div>}
 </section>;
}
