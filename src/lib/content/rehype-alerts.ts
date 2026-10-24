type HtmlNode={type:string;tagName?:string;value?:string;properties?:Record<string,unknown>;children?:HtmlNode[]};
const labels={note:'Note',tip:'Tip',important:'Important',warning:'Warning',caution:'Caution'} as const;
type AlertKind=keyof typeof labels;
const textOf=(node:HtmlNode):string=>node.value||(node.children||[]).map(textOf).join('');
const isBlank=(node:HtmlNode)=>node.type==='text'&&!node.value?.trim();

/** Support GitHub alert markers and the existing > **Note** / > **Warning** format. */
export default function rehypeAlerts(){
 return (tree:HtmlNode)=>{
  function visit(node:HtmlNode){
   if(node.tagName==='blockquote'){
    const paragraph=node.children?.find(child=>!isBlank(child));
    const first=paragraph?.children?.find(child=>!isBlank(child));
    let kind:AlertKind|undefined;
    if(paragraph?.tagName==='p'&&first){
     if(first.type==='text'){
      const marker=first.value?.match(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(?:\r?\n|$)/i);
      if(marker){kind=marker[1].toLowerCase() as AlertKind;first.value=first.value!.slice(marker[0].length)}
     }else if(first.tagName==='strong'){
      const label=textOf(first).trim().toLowerCase();
      if(Object.hasOwn(labels,label)){kind=label as AlertKind;paragraph.children=paragraph.children!.filter(child=>child!==first)}
     }
     if(kind){
      const leading=paragraph.children?.find(child=>!isBlank(child));
      if(leading?.type==='text')leading.value=leading.value?.trimStart();
      if(!paragraph.children?.some(child=>!isBlank(child)))node.children=node.children!.filter(child=>child!==paragraph);
      const current=node.properties?.className;
      node.properties={...node.properties,className:[...(Array.isArray(current)?current:typeof current==='string'?[current]:[]),'markdown-alert',`markdown-alert-${kind}`],'data-alert':kind};
      node.children!.unshift({type:'element',tagName:'p',properties:{className:['markdown-alert-title']},children:[{type:'text',value:labels[kind]}]});
     }
    }
   }
   node.children?.forEach(visit);
  }
  visit(tree);
 };
}
