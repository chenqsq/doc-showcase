import { useEffect, useId, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidBlockProps {
  chart: string;
}

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'neutral',
  fontFamily:
    '"Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif'
});

export function MermaidBlock({ chart }: MermaidBlockProps) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const elementId = useId().replace(/:/g, '-');

  useEffect(() => {
    let cancelled = false;

    mermaid
      .render(`mermaid-${elementId}`, chart)
      .then(({ svg: rendered }) => {
        if (!cancelled) {
          setSvg(rendered);
          setError('');
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : 'Mermaid 渲染失败');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chart, elementId]);

  if (error) {
    return (
      <div className="mermaid-fallback">
        <div className="section-kicker">Mermaid 渲染失败</div>
        <pre>{chart}</pre>
      </div>
    );
  }

  return <div className="mermaid-block" dangerouslySetInnerHTML={{ __html: svg }} />;
}
