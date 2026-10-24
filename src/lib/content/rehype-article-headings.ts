type HtmlNode={type:string;tagName?:string;children?:HtmlNode[]};
/** The page already owns h1; preserve an imported article's relative heading levels. */
export default function rehypeArticleHeadings(){
 return (tree:HtmlNode)=>{
  function visit(node:HtmlNode,action:(node:HtmlNode)=>void){action(node);node.children?.forEach(child=>visit(child,action))}
  let hasTitle=false;
  visit(tree,node=>{if(node.tagName==='h1')hasTitle=true});
  if(hasTitle)visit(tree,node=>{if(node.tagName&&/^h[1-5]$/.test(node.tagName))node.tagName=`h${Number(node.tagName[1])+1}`});
 };
}
