import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evaluate} from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import rehypeAlerts from '../src/lib/content/rehype-alerts';
async function render(body:string){const {default:MDX}=await evaluate(body,{...runtime,rehypePlugins:[rehypeAlerts]});return renderToStaticMarkup(runtime.jsx(MDX,{}))}
for(const label of ['NOTE','TIP','IMPORTANT','WARNING','CAUTION'])test(`GitHub ${label} markers become typed alerts`,async()=>{
 const html=await render(`> [!${label}]\n> Keep this body.`);assert.ok(html.includes(`markdown-alert-${label.toLowerCase()}`));assert.ok(html.includes('Keep this body.'));assert.ok(!html.includes(`[!${label}]`));assert.equal((html.match(/markdown-alert-title/g)||[]).length,1);
});
test('Legacy warning retains its list and separates title from body',async()=>{
 const html=await render('> **Warning**\n>\n> - First item\n> - Second item');assert.match(html,/markdown-alert-warning/);assert.match(html,/<li>First item<\/li>/);assert.match(html,/<li>Second item<\/li>/);assert.match(html,/markdown-alert-title">Warning<\/p>/);
});
test('Legacy inline Note retains exception details and line breaks',async()=>{
 const html=await render('> **Note**\n> org.hibernate.StaleObjectStateException<br />\n> 설명입니다.');assert.match(html,/markdown-alert-note/);assert.match(html,/org.hibernate.StaleObjectStateException/);assert.match(html,/<br\/>/);assert.match(html,/설명입니다\./);assert.ok(!html.includes('<p></p>'));
});
test('Ordinary quotes and alert-looking code remain unchanged',async()=>{
 const html=await render('> **Note about locks**\n> Ordinary quote.\n\n```text\n> [!WARNING]\n```');assert.ok(!html.includes('class="markdown-alert'));assert.match(html,/Note about locks/);assert.match(html,/\[!WARNING\]/);
});

for(const marker of ['**Info**','**INFO**','[!INFO]'])test(`${marker} uses the blue GitHub Note alert`,async()=>{
 const html=await render(`> ${marker}\n> 띠링~<br />\n> 주문 완료`);
 assert.match(html,/markdown-alert-note/);assert.match(html,/data-alert="note"/);assert.match(html,/markdown-alert-title">Note<\/p>/);
 assert.match(html,/띠링~/);assert.match(html,/<br\/>/);assert.match(html,/주문 완료/);assert.ok(!html.includes('Info'));
});
