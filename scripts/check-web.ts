import fs from 'node:fs/promises';
import {verifyBlogNavigation} from './verify-navigation';
import {chromium} from 'playwright';
import {serveExport} from './static-server';
import {published} from '../src/lib/content/loader';
import {PAGE_SIZE} from '../src/lib/pagination';
import {formatPostTitle} from '../src/lib/post-title';
const posts=published();const firstPageCount=Math.min(PAGE_SIZE,posts.length);
const server=await serveExport();const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||undefined});const failures:string[]=[];
await fs.mkdir('tmp/qa/pages',{recursive:true});
try{
 const page=await browser.newPage({colorScheme:'dark'});page.on('pageerror',e=>failures.push(e.message));await page.addInitScript(()=>localStorage.setItem('theme','dark'));
 const routes=['/',...published().map(p=>p.href)];
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:1000});
  let baseline:{x:number;width:number}|undefined;
  for(const route of routes){
   const response=await page.goto(server.url+route,{waitUntil:'networkidle'});if(response?.status()!==200)failures.push(`${route}: HTTP ${response?.status()}`);
   await page.evaluate(()=>document.fonts.ready);
   if(!await page.evaluate(()=>document.fonts.check('16px Pretendard')&&getComputedStyle(document.body).fontFamily.includes('Pretendard')))failures.push(`${route}: Pretendard font`);
   if(route!=='/'&&await page.locator('main h1').textContent()!==formatPostTitle(posts.find(p=>p.href===route)!))failures.push(`${route}: category title`);
   if(await page.locator('.prose').evaluateAll(nodes=>nodes.some(n=>{const copy=n.cloneNode(true) as HTMLElement;copy.querySelectorAll('pre,code').forEach(c=>c.remove());return (copy.textContent||'').includes('**')})))failures.push(`${route}: leaked Markdown emphasis`);
   const frame=await page.locator('main .container').first().boundingBox();
   if(!frame)failures.push(`${route}: missing container`);
   else if(!baseline)baseline={x:frame.x,width:frame.width};
   else if(Math.abs(frame.width-baseline.width)>1||Math.abs(frame.x-baseline.x)>1)failures.push(`${route}: inconsistent container`);
   if(await page.locator('a[href^="/topics/"],a[href^="/about/"]').count())failures.push('Removed topics UI remains');
   if(await page.locator('main h1').count()!==1)failures.push(`${route}: heading`);
   if(await page.locator('main img').evaluateAll(images=>images.some(img=>!(img as HTMLImageElement).complete||(img as HTMLImageElement).naturalWidth===0)))failures.push(`${route}: broken article image`);
   if(await page.locator('main').getByText(/^(Topics|Topic|About this blog)$/).count())failures.push('English page label remains');
   if(await page.getByRole('navigation',{name:'주 메뉴'}).locator('[aria-current="page"]').count()!==1)failures.push('Active navigation');

   if(await page.locator('.site-footer').count())failures.push(`${route}: removed footer remains`);
   if(await page.locator('.post-pagination>p').count())failures.push('Duplicate post range remains');
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))failures.push(`${route}: ${width}px overflow`);
   if(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor)!=='rgb(255, 255, 255)')failures.push(`${route}: fixed light theme`);
   if(await page.locator('[data-theme],.theme-toggle').count())failures.push('Theme control remains');
   if(await page.locator('a[href^="/experience/"],a[href^="/projects/"],a[href^="/portfolio/"],a[href^="/activities/"],a[href^="/skills/"]').count())failures.push('Legacy career navigation remains');
   for(const link of await page.locator('a[href^="/"]').evaluateAll(els=>els.map(e=>e.getAttribute('href')!))){const r=await page.request.get(server.url+link);if(r.status()!==200)failures.push(`Broken link ${link}`)}
   await page.screenshot({path:`tmp/qa/pages/${route==='/'?'home':route.split('/').filter(Boolean).join('-')}-${width}.png`});
   if(route==='/'){await page.screenshot({path:`tmp/qa/tech-blog-first-view-${width}.png`});await page.screenshot({path:`tmp/qa/tech-blog-${width}.png`,fullPage:true})}
   if(route===published()[0].href)await page.screenshot({path:`tmp/qa/tech-post-${width}.png`,fullPage:true});
  }
 }
 await page.goto(server.url,{waitUntil:'networkidle'});if(await page.locator('.blog-post').count()!==firstPageCount)failures.push('Post count');
 if(await page.locator('.post-category,.post-meta span').count())failures.push('Date-only post metadata');
 if(await page.locator('.wordmark').textContent()!=='DHistory')failures.push('Brand');
 if(await page.locator('.blog-intro').count())failures.push('Home intro remains');
 const pager=page.getByRole('navigation',{name:'글 목록 페이지'});
 if(!await pager.getByRole('button',{name:'이전 페이지'}).isDisabled()||(await pager.getByRole('button',{name:'다음 페이지'}).isDisabled())!==(posts.length<=PAGE_SIZE))failures.push('Pagination bounds');
 if(await pager.getByRole('button',{name:'1페이지',exact:true}).getAttribute('aria-current')!=='page')failures.push('Current page indicator');
 if(posts.length>PAGE_SIZE){
  await pager.getByRole('button',{name:'다음 페이지'}).click();
  const titles=await page.locator('.blog-post h3').allTextContents();
  if(JSON.stringify(titles)!==JSON.stringify(posts.slice(PAGE_SIZE,PAGE_SIZE*2).map(formatPostTitle)))failures.push('Second page post order');
  const last=Math.ceil(posts.length/PAGE_SIZE);await pager.getByRole('button',{name:`${last}페이지`,exact:true}).click();
  if(!await pager.getByRole('button',{name:'다음 페이지'}).isDisabled())failures.push('Last page next boundary');
  if(await page.locator('.blog-post').count()!==posts.slice((last-1)*PAGE_SIZE).length)failures.push('Last page count');
 }
 const filters=page.getByRole('group',{name:'카테고리 선택'});
 for(const category of [...new Set(posts.map(p=>p.category))]){
  const button=filters.getByRole('button',{name:category,exact:true});await button.click();
  if(await button.getAttribute('aria-pressed')!=='true')failures.push('Active category');
  if(await page.getByRole('button',{name:'1페이지',exact:true}).getAttribute('aria-current')!=='page')failures.push('Category must reset pagination');
  if(await page.locator('.blog-post').count()!==Math.min(PAGE_SIZE,posts.filter(p=>p.category===category).length))failures.push('Category filtering');
 }
 await filters.getByRole('button',{name:'리더십',exact:true}).click();
 if(!posts.some(p=>p.category==='리더십')&&!await page.getByText('아직 등록된 글이 없어요').isVisible())failures.push('Empty leadership category');
 await filters.getByRole('button',{name:'전체',exact:true}).click();
 await page.getByRole('searchbox',{name:'글 검색'}).fill('Outbox');if(await page.locator('.blog-post').count()!==Math.min(PAGE_SIZE,posts.filter(p=>`${p.title} ${p.description} ${p.category} ${p.tags.join(' ')}`.toLowerCase().includes('outbox')).length))failures.push('Search');
 await page.getByRole('searchbox',{name:'글 검색'}).fill('no matching entry');if(!await page.getByText('검색 결과가 없어요').isVisible())failures.push('Empty state');
 await page.getByRole('button',{name:'전체 글 보기',exact:true}).click();if(await page.locator('.blog-post').count()!==firstPageCount)failures.push('Reset');
 await page.goto(server.url+posts[0].href);await page.getByRole('navigation',{name:'주 메뉴'}).getByRole('link',{name:'글',exact:true}).click();await page.waitForURL(server.url+'/');
 for(const route of ['/about/','/experience/','/projects/','/activities/','/skills/','/portfolio/print/','/topics/','/topics/jpa/','/topics/architecture/','/topics/database/']){const r=await page.request.get(server.url+route);if(r.status()!==404)failures.push(`Legacy route still served ${route}`)}
 for(const route of ['/robots.txt','/sitemap.xml']){const r=await page.request.get(server.url+route);if(r.status()!==200)failures.push(`Missing ${route}`)}
 await verifyBlogNavigation(page,server.url);
 if(failures.length)throw Error(failures.join('\n'));
 console.log(`Technical blog QA passed: ${routes.length} routes, mobile/desktop, category selection, navigation without topic pages, search/reset, pagination bounds, matching containers and heading rhythm, Korean labels, removed footer, light theme and removed career routes.`);
}finally{await browser.close();await server.close()}
