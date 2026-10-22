import type {Metadata} from 'next';
import Link from 'next/link';
import './globals.css';
import {Navigation} from '@/components/Navigation';
import {site} from '@/lib/site';
export const metadata:Metadata={metadataBase:new URL(site.url),title:{default:site.title,template:`%s | ${site.title}`},description:site.description,openGraph:{title:site.title,description:site.description,type:'website',locale:'ko_KR',url:site.url}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body><a className="skip-link" href="#main">본문으로 이동</a><header className="site-header"><Link className="wordmark" href="/">DHistory</Link><Navigation/></header><main id="main">{children}</main></body></html>}
