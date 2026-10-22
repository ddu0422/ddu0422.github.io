import assert from 'node:assert/strict';
import type {Page} from 'playwright';
export async function verifyBlogNavigation(page:Page,url:string){
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:1000});
  await page.goto(url,{waitUntil:'networkidle'});
  const filters=page.getByRole('group',{name:'카테고리 선택'});
  await filters.getByRole('button',{name:'백엔드',exact:true}).click();
  await page.getByRole('button',{name:'2페이지',exact:true}).click();
  assert.equal(new URL(page.url()).searchParams.get('category'),'백엔드');
  assert.equal(new URL(page.url()).searchParams.get('page'),'2');
  const titles=await page.locator('.blog-post h3').allTextContents();
  const listUrl=page.url();
  await page.locator('.blog-post h3 a').first().click();
  await page.waitForURL('**/posts/**');
  await page.goBack();
  await page.waitForURL(listUrl);
  await page.waitForSelector('.blog-filters button[aria-pressed="true"]');
  assert.equal(await filters.getByRole('button',{name:'백엔드',exact:true}).getAttribute('aria-pressed'),'true');
  assert.equal(await page.getByRole('button',{name:'2페이지',exact:true}).getAttribute('aria-current'),'page');
  assert.deepEqual(await page.locator('.blog-post h3').allTextContents(),titles);
  await page.reload({waitUntil:'networkidle'});
  assert.deepEqual(await page.locator('.blog-post h3').allTextContents(),titles);
  await filters.getByRole('button',{name:'시스템 설계',exact:true}).click();
  await page.getByRole('searchbox',{name:'글 검색'}).fill('Outbox');
  await page.waitForFunction(()=>new URLSearchParams(location.search).get('q')==='Outbox');
  const searchUrl=page.url();
  await page.locator('.blog-post h3 a').first().click();await page.waitForURL('**/posts/**');
  await page.goBack();await page.waitForURL(searchUrl);
  await page.waitForSelector('input[value="Outbox"]');
  assert.equal(await filters.getByRole('button',{name:'시스템 설계',exact:true}).getAttribute('aria-pressed'),'true');
  assert.equal(await page.getByRole('searchbox',{name:'글 검색'}).inputValue(),'Outbox');
  await page.locator('.blog-post h3 a').first().click();await page.waitForURL('**/posts/**');
  // Previous/next links use client navigation: the TOC must change with the article.
  for(let step=0;step<3;step++){
   const selector=await page.locator('.next-post').count()?'.next-post':'.previous-post';
   const target=await page.locator(selector).getAttribute('href');
   await page.locator(selector).click();await page.waitForURL(url+target);
   await page.waitForFunction(()=>{const links=[...document.querySelectorAll('#article-toc a')].map(n=>n.textContent);const headings=[...document.querySelectorAll('.prose h2,.prose h3')].map(n=>n.textContent).filter(t=>t?.trim());return links.length>0&&JSON.stringify(links)===JSON.stringify(headings)});
   const headingLinks=await page.locator('#article-toc a').allTextContents();
   const currentHeadings=await page.locator('.prose h2,.prose h3').allTextContents();
   assert.deepEqual(headingLinks,currentHeadings.filter(t=>t.trim()));
  }
  for(const slug of ['dual-write-and-outbox','jpa-lock-and-refresh','tistory-272','tistory-250']){
   if(!page.url().includes(`/posts/${slug}/`)){
    await page.goto(url+`/posts/${slug}/`,{waitUntil:'networkidle'});
   }
   const toc=page.getByRole('navigation',{name:'본문 목차'});
   assert.ok(await toc.isVisible());
   const headings=await page.locator('.prose h2[id],.prose h3[id]').evaluateAll(nodes=>nodes.filter(n=>n.textContent?.trim()).map(n=>({id:n.id,text:n.textContent?.trim()})));
   const links=await toc.locator('a').evaluateAll(nodes=>nodes.map(n=>({id:decodeURIComponent(n.getAttribute('href')!.slice(1)),text:n.textContent?.trim()})));
   assert.deepEqual(links,headings);
   const last=links.at(-1)!;
   if(width<=900)await toc.getByRole('button',{name:'목차',exact:true}).click();
   await toc.locator('a').last().click();
   await page.waitForFunction(id=>decodeURIComponent(location.hash.slice(1))===id,last.id);
   await page.waitForFunction(id=>document.activeElement?.id===id,last.id);
   if(width<=900)assert.equal(await toc.getByRole('button',{name:'목차',exact:true}).getAttribute('aria-expanded'),'false');
   assert.equal(await page.locator('.article-meta a,.toc-return').count(),0);
   for(let repeat=0;repeat<2;repeat++){
    await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,document.body.scrollHeight)});
    if(width<=900)await toc.getByRole('button',{name:'목차',exact:true}).click();
    await toc.locator('a').first().click();
    await page.waitForFunction(id=>document.activeElement?.id===id,links[0].id);
    const position=await page.locator('.prose h2,.prose h3').first().boundingBox();
    const atBottom=await page.evaluate(()=>scrollY+innerHeight>=document.documentElement.scrollHeight-2);
    // Short articles cannot scroll farther than the document bottom.
    assert.ok(position&&position.y>=0&&(position.y<=120||(atBottom&&position.y<500)),`${slug}: section did not move into view (${position?.y}px)`);
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   await page.screenshot({path:`tmp/qa/navigation-${slug}-${width}.png`});
  }
 }
 // A direct static response includes the TOC without waiting for client effects.
 const response=await page.request.get(url+'/posts/dual-write-and-outbox/');
 assert.match(await response.text(),/id="article-toc"/);
 console.log('Navigation verified: browser back/reload preserves category, page and search; server-rendered TOC links and mobile disclosure work on mobile/desktop.');
}
