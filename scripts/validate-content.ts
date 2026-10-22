import {compile} from '@mdx-js/mdx';
import {loadPosts} from '../src/lib/content/loader';
const posts=loadPosts();for(const post of posts)await compile(post.body);
console.log(`Validated ${posts.length} technical posts.`);
