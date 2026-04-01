import { useEffect, useId, useMemo, useState } from 'react';
import mermaid from 'mermaid';
import type { LightboxState } from '../types';

interface MermaidBlockProps {
  chart: string;
  title: string;
  onOpenLightbox: (lightbox: LightboxState) => void;
}

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'neutral',
  flowchart: {
    useMaxWidth: false,
    htmlLabels: true
  },
  fontFamily:
    '"Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif'
});

export function MermaidBlock({ chart, title, onOpenLightbox }: MermaidBlockProps) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const elementId = useId().replace(/:/g, '-');
  const svgDataUrl = useMemo(
    () => (svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : ''),
    [svg]
  );

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

  return (
    <div className="mermaid-block">
      <div className="mermaid-toolbar">
        <div className="section-kicker">Mermaid 图表</div>
        <button
          type="button"
          className="inline-figure-zoom"
          onClick={() => onOpenLightbox({ src: svgDataUrl, title })}
          disabled={!svg}
        >
          放大查看
        </button>
      </div>
      <button
        type="button"
        className="mermaid-stage"
        onClick={() => onOpenLightbox({ src: svgDataUrl, title })}
        disabled={!svg}
        aria-label={`放大查看 ${title}`}
      >
        <span className="mermaid-stage-inner" dangerouslySetInnerHTML={{ __html: svg }} />
      </button>
    </div>
  );
}
