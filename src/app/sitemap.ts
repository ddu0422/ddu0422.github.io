import type {MetadataRoute} from 'next';
import {published} from '@/lib/content/loader';
import {site} from '@/lib/site';
export const dynamic='force-static';
export default function sitemap():MetadataRoute.Sitemap{return ['/',...published().map(p=>p.href)].map(href=>({url:site.url+href}))}
