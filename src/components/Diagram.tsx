'use client';
import { useEffect, useRef, useState } from 'react';
let queue = Promise.resolve();
export function Diagram({ children, caption = 'Architecture diagram' }: { children: string; caption?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState('loading');
  useEffect(() => {
    let disposed = false;
    queue = queue.then(async () => {
      const { default: mermaid } = await import('mermaid');
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral', fontFamily: 'Pretendard', deterministicIds: true });
      const id = `diagram-${Math.random().toString(36).slice(2)}`;
      const { svg } = await mermaid.render(id, children.trim());
      if (!disposed && ref.current) { ref.current.innerHTML = svg; setState('ready'); }
    }).catch(() => { if (!disposed) setState('error'); });
    return () => { disposed = true; };
  }, [children]);
  return <figure className="diagram" data-diagram-state={state}>
    <div ref={ref} role="img" aria-label={caption} />
    {state === 'loading' && <p>다이어그램을 준비하고 있습니다.</p>}
    {state === 'error' && <p role="alert">다이어그램 렌더링 실패</p>}
    <figcaption>{caption}</figcaption>
  </figure>;
}
