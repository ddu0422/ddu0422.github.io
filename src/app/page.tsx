import {published} from '@/lib/content/loader';
import {BlogPosts} from '@/components/BlogPosts';
import {BlogSidebar} from '@/components/BlogSidebar';
export const metadata={alternates:{canonical:'/'}};
export default function Home(){const posts=published();return <div className="blog-home container"><div className="blog-layout"><BlogPosts items={posts} headingAs="h1"/><BlogSidebar/></div></div>}
