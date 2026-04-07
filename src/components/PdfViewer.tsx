import { ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StealthScrollArea } from './StealthScrollArea';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

interface PdfViewerProps {
  src: string;
  title: string;
}

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });

    observer.observe(ref.current);
    setWidth(ref.current.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

export function PdfViewer({ src, title }: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [loadError, setLoadError] = useState('');
  const [useNativeFallback, setUseNativeFallback] = useState(false);
  const { ref, width } = useElementWidth<HTMLDivElement>();

  const pageWidth = useMemo(() => {
    if (!width) {
      return 720;
    }

    return Math.max(280, Math.min(width - 32, 980));
  }, [width]);

  const shouldPreferNative = src.includes('/@fs/');

  useEffect(() => {
    let cancelled = false;

    setPdfData(null);
    setLoadError('');
    setUseNativeFallback(false);
    setNumPages(0);
    setPageNumber(1);

    fetch(src)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`PDF 请求失败：${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
      })
      .then((data) => {
        if (!cancelled) {
          setPdfData(data);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setLoadError(reason instanceof Error ? reason.message : 'PDF 加载失败');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="grid gap-2">
          <Badge variant="outline" className="w-fit">
            PDF 阅读
          </Badge>
          <h2 className="font-serif text-[clamp(1.6rem,2vw,2.1rem)] text-foreground">{title}</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setZoom((value) => Math.max(0.8, value - 0.1))}>
            <ZoomOut className="h-4 w-4" />
            缩小
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => setZoom(1)}>
            适中
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => setZoom((value) => Math.min(2.2, value + 0.1))}>
            <ZoomIn className="h-4 w-4" />
            放大
          </Button>
          <Button asChild variant="secondary" size="sm">
            <a href={src} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              原文件
            </a>
          </Button>
        </div>
      </div>

      {loadError ? (
        <div className="rounded-[1.6rem] border border-dashed border-border bg-card/70 p-5 text-sm leading-6 text-muted-foreground">
          {loadError}
        </div>
      ) : null}

      {useNativeFallback || shouldPreferNative ? (
        <div className="grid gap-4">
          <div className="rounded-[1.6rem] border border-dashed border-border bg-card/70 p-5 text-sm leading-6 text-muted-foreground">
            {shouldPreferNative
              ? '当前开发环境优先使用浏览器原生 PDF 预览，避免本地路径兼容问题。'
              : '当前环境已切换为原生 PDF 预览，以保证资料继续可读。'}
          </div>
          <iframe className="min-h-[78vh] w-full rounded-[1.6rem] border border-border bg-card" src={src} title={title} />
        </div>
      ) : null}

      {!useNativeFallback && !shouldPreferNative ? (
        <Document
          file={pdfData ? { data: pdfData } : null}
          loading={<div className="rounded-[1.6rem] border border-dashed border-border bg-card/70 p-5 text-sm text-muted-foreground">PDF 加载中…</div>}
          error={<div className="rounded-[1.6rem] border border-dashed border-border bg-card/70 p-5 text-sm text-muted-foreground">PDF 无法渲染，请直接打开原文件查看。</div>}
          onLoadSuccess={({ numPages: loadedPages }) => {
            setNumPages(loadedPages);
            setPageNumber((current) => Math.min(current, loadedPages));
          }}
          onLoadError={() => {
            setUseNativeFallback(true);
          }}
        >
          <div className="grid gap-4 lg:grid-cols-[136px,minmax(0,1fr)]">
            <aside className="grid content-start gap-3">
              <Badge variant="outline" className="w-fit">
                页缩略图
              </Badge>
              <StealthScrollArea axis="y" className="grid max-h-[78vh] gap-2 overflow-auto">
                {Array.from({ length: numPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`grid gap-2 justify-items-center rounded-[1.25rem] border px-2.5 py-3 transition-colors ${
                      page === pageNumber ? 'border-primary/30 bg-accent shadow-[var(--shadow-soft)]' : 'border-border/70 bg-background/70 hover:bg-card'
                    }`.trim()}
                    onClick={() => setPageNumber(page)}
                  >
                    <Page pageNumber={page} width={88} renderAnnotationLayer={false} renderTextLayer={false} />
                    <span className="text-xs text-muted-foreground">第 {page} 页</span>
                  </button>
                ))}
              </StealthScrollArea>
            </aside>

            <section className="grid gap-3" ref={ref}>
              <div className="flex flex-wrap items-center justify-center gap-3 rounded-[1.5rem] border border-border/70 bg-card/75 p-3 text-sm text-foreground">
                <Button type="button" variant="secondary" size="sm" onClick={() => setPageNumber((value) => Math.max(1, value - 1))}>
                  上一页
                </Button>
                <Separator orientation="vertical" className="hidden h-5 sm:block" />
                <span>
                  第 {pageNumber} / {numPages || '?'} 页
                </span>
                <Separator orientation="vertical" className="hidden h-5 sm:block" />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setPageNumber((value) => Math.min(numPages || value, value + 1))}
                >
                  下一页
                </Button>
              </div>

              <StealthScrollArea axis="both" className="grid justify-items-center overflow-auto rounded-[1.7rem] border border-border/70 bg-card/70 p-[var(--reader-figure-padding)]">
                <Page
                  pageNumber={pageNumber}
                  width={pageWidth * zoom}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  loading={<div className="rounded-[1.4rem] border border-dashed border-border bg-card/70 p-4 text-sm text-muted-foreground">页面渲染中…</div>}
                />
              </StealthScrollArea>
            </section>
          </div>
        </Document>
      ) : null}
    </div>
  );
}
