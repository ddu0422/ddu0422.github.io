'use client';
import {useEffect,useState} from 'react';
export type ArticleHeading={id:string;text:string;level:2|3};
export function TableOfContents({headings}:{headings:ArticleHeading[]}){
 const [open,setOpen]=useState(false);
 const [active,setActive]=useState(headings[0]?.id||'');
 useEffect(()=>{
  setOpen(location.hash==='#article-toc');
  const elements=headings.map(h=>document.getElementById(h.id)).filter((el):el is HTMLElement=>!!el);
  let frame=0;
  const update=()=>{frame=0;const passed=elements.filter(el=>el.getBoundingClientRect().top<=110);const bottom=scrollY+innerHeight>=document.documentElement.scrollHeight-2;setActive((bottom?elements.at(-1):passed.at(-1)||elements[0])?.id||'')};
  const onScroll=()=>{if(!frame)frame=requestAnimationFrame(update)};
  update();window.addEventListener('scroll',onScroll,{passive:true});
  return ()=>{window.removeEventListener('scroll',onScroll);cancelAnimationFrame(frame)};
 },[headings]);
 const navigate=(event:React.MouseEvent<HTMLAnchorElement>,id:string)=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const target=document.getElementById(id);if(!target)return;
  event.preventDefault();setOpen(false);setActive(id);
  window.history.replaceState(window.history.state,'',`#${encodeURIComponent(id)}`);
  target.scrollIntoView({behavior:'instant',block:'start'});
  target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
 };
 return <nav id="article-toc" className="article-toc" aria-label="본문 목차"><span className="toc-heading">이 글의 목차</span><button className="toc-toggle" type="button" aria-expanded={open} aria-controls="article-toc-list" onClick={()=>setOpen(value=>!value)}>목차<svg aria-hidden="true" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5"/></svg></button><ul id="article-toc-list" className={`toc-list${open?' is-open':''}`}>{headings.map(h=><li key={h.id} className={h.level===3?'toc-subheading':undefined}><a href={`#${encodeURIComponent(h.id)}`} aria-current={active===h.id?'location':undefined} onClick={event=>navigate(event,h.id)}>{h.text}</a></li>)}</ul></nav>;
}
