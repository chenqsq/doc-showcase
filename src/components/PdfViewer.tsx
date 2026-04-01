import { useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

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
    return Math.max(320, Math.min(width - 32, 940));
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
    <div className="pdf-viewer">
      <div className="reader-toolbar">
        <div>
          <div className="section-kicker">PDF 阅读器</div>
          <h2>{title}</h2>
        </div>
        <div className="toolbar-actions">
          <button type="button" onClick={() => setZoom((value) => Math.max(0.8, value - 0.1))}>
            缩小
          </button>
          <button type="button" onClick={() => setZoom(1)}>
            适中
          </button>
          <button type="button" onClick={() => setZoom((value) => Math.min(2.4, value + 0.1))}>
            放大
          </button>
          <a href={src} target="_blank" rel="noreferrer">
            原文件打开
          </a>
        </div>
      </div>

      {loadError ? <div className="empty-state">{loadError}</div> : null}

      {useNativeFallback || shouldPreferNative ? (
        <div className="pdf-native-fallback">
          <div className="empty-state">
            {shouldPreferNative
              ? '当前开发环境优先使用浏览器原生 PDF 预览，避免本地文件路径兼容问题。'
              : '当前环境下切换为浏览器原生 PDF 预览，以保证资料可继续查看。'}
          </div>
          <iframe className="pdf-native-frame" src={src} title={title} />
        </div>
      ) : null}

      {!useNativeFallback && !shouldPreferNative ? (
        <Document
          file={pdfData ? { data: pdfData } : null}
          loading={<div className="empty-state">PDF 加载中…</div>}
          error={
            <div className="empty-state">
              Failed to load PDF file.
            </div>
          }
          onLoadSuccess={({ numPages: loadedPages }) => {
            setNumPages(loadedPages);
            setPageNumber((current) => Math.min(current, loadedPages));
          }}
          onLoadError={() => {
            setUseNativeFallback(true);
          }}
        >
          <div className="pdf-layout">
            <aside className="pdf-thumbnails">
              <div className="section-kicker">页缩略图</div>
              <div className="thumbnail-list">
                {Array.from({ length: numPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`thumbnail-item ${page === pageNumber ? 'is-active' : ''}`}
                    onClick={() => setPageNumber(page)}
                  >
                    <Page pageNumber={page} width={88} renderAnnotationLayer={false} renderTextLayer={false} />
                    <span>第 {page} 页</span>
                  </button>
                ))}
              </div>
            </aside>

            <section className="pdf-stage" ref={ref}>
              <div className="pdf-stage-toolbar">
                <button type="button" onClick={() => setPageNumber((value) => Math.max(1, value - 1))}>
                  上一页
                </button>
                <span>
                  第 {pageNumber} / {numPages || '?'} 页
                </span>
                <button type="button" onClick={() => setPageNumber((value) => Math.min(numPages || value, value + 1))}>
                  下一页
                </button>
              </div>
              <div className="pdf-page-frame">
                <Page
                  pageNumber={pageNumber}
                  width={pageWidth * zoom}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  loading={<div className="empty-state">页面渲染中…</div>}
                />
              </div>
            </section>
          </div>
        </Document>
      ) : null}
    </div>
  );
}
