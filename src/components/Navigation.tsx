'use client';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
export function Navigation(){const pathname=usePathname();return <nav aria-label="주 메뉴" className="main-nav">{[['/','글']].map(([href,label])=><Link key={href} href={href} aria-current={(href==='/'?pathname==='/'||pathname.startsWith('/posts/'):pathname.startsWith(href))?'page':undefined}>{label}</Link>)}</nav>}
