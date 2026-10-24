import {evaluate} from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeAlerts from '@/lib/content/rehype-alerts';
import rehypeArticleHeadings from '@/lib/content/rehype-article-headings';
import {Diagram} from './Diagram';
import {TableOfContents,type ArticleHeading} from './TableOfContents';
import type {ComponentProps} from 'react';
type HtmlNode={type:string;tagName?:string;properties?:{id?:unknown};value?:string;children?:HtmlNode[]};
function nodeText(node:HtmlNode):string{return node.value||(node.children||[]).map(nodeText).join('')}
export async function ContentBody({body,articleId}:{body:string;articleId:string}){
 const headings:ArticleHeading[]=[];
 function collectHeadings(){return (tree:HtmlNode)=>{
  function visit(node:HtmlNode){if((node.tagName==='h2'||node.tagName==='h3')&&typeof node.properties?.id==='string'){const text=nodeText(node).trim();if(text)headings.push({id:node.properties.id,text,level:node.tagName==='h2'?2:3})}node.children?.forEach(visit)}
  visit(tree);
 }}
 const {default:MDX}=await evaluate(body,{...runtime,remarkPlugins:[[remarkGfm,{singleTilde:false}]],rehypePlugins:[rehypeArticleHeadings,rehypeAlerts,rehypeSlug,collectHeadings,rehypeHighlight]});
 return <><div className={`article-layout${headings.length?'':' article-layout-without-toc'}`}><div className="prose"><MDX components={{Diagram,table:(props:ComponentProps<'table'>)=><div className="table-scroll" role="region" aria-label="표" tabIndex={0}><table {...props}/></div>}}/></div>{headings.length>0&&<aside><TableOfContents key={articleId} headings={headings}/></aside>}</div></>;
}
