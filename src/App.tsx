import { type CSSProperties, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  buildAppearanceVars,
  FONT_SCALE_PRESETS,
  getThemePreset,
  readAppearance,
  THEME_PRESETS,
  type AppearanceState,
  type FontScaleId,
  type ThemeId,
  writeAppearance
} from './appearance';
import {
  catalogById,
  extractOutline,
  featuredResources,
  getImageResourcesForItem,
  getRelatedResources,
  navigableCatalog,
  searchCatalog,
  topLevelLayers
} from './catalog';
import { MarkdownArticle } from './components/MarkdownArticle';
import { PdfViewer } from './components/PdfViewer';
import { ZoomLightbox } from './components/ZoomLightbox';
import type { CatalogItem, Layer, LightboxState } from './types';

const RECENT_KEY = 'doc-showcase-recent';
const HEADER_FALLBACK_HEIGHT = 100;
type MobilePanel = 'closed' | 'catalog' | 'context' | 'appearance';

type ShellStyle = CSSProperties & {
  [key: `--${string}`]: string;
};

function readRecentIds(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function writeRecentIds(ids: string[]) {
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, 8)));
}

function App() {
  const [search, setSearch] = useState('');
  const [layerFilter, setLayerFilter] = useState<Layer | '全部'>('全部');
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('closed');
  const [mobileQuickNavOpen, setMobileQuickNavOpen] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [recentIds, setRecentIds] = useState<string[]>(() => readRecentIds());
  const [appearance, setAppearance] = useState<AppearanceState>(() => readAppearance());
  const [headerHeight, setHeaderHeight] = useState(HEADER_FALLBACK_HEIGHT);
  const [headerCompressed, setHeaderCompressed] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const location = useLocation();
  const isReaderRoute = location.pathname.startsWith('/read/');
  const isLibraryRoute = location.pathname === '/library';

  useEffect(() => {
    setMobilePanel('closed');
    setMobileQuickNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return;
    }

    const measureHeader = () => {
      setHeaderHeight(Math.round(header.getBoundingClientRect().height));
    };

    measureHeader();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      measureHeader();
    });

    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncHeaderShadow = () => {
      setHeaderCompressed(window.scrollY > 8);
    };

    syncHeaderShadow();
    window.addEventListener('scroll', syncHeaderShadow, { passive: true });
    return () => window.removeEventListener('scroll', syncHeaderShadow);
  }, []);

  useEffect(() => {
    writeAppearance(appearance);
  }, [appearance]);

  useEffect(() => {
    if (mobilePanel === 'closed') {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobilePanel('closed');
      }
    };

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobilePanel]);

  useEffect(() => {
    if (!mobileQuickNavOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileQuickNavOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileQuickNavOpen]);

  const filteredCatalog = useMemo(
    () => searchCatalog(navigableCatalog, search, layerFilter),
    [search, layerFilter]
  );

  const recentItems = useMemo(
    () =>
      recentIds
        .map((id) => catalogById.get(id))
        .filter((item): item is CatalogItem => Boolean(item) && item?.type !== 'image'),
    [recentIds]
  );

  const rememberResource = useCallback((item: CatalogItem) => {
    setRecentIds((current) => {
      const next = [item.id, ...current.filter((id) => id !== item.id)].slice(0, 8);
      writeRecentIds(next);
      return next;
    });
  }, []);

  const shellStyle: ShellStyle = useMemo(
    () => ({
      ...buildAppearanceVars(appearance),
      '--shell-padding': '20px',
      '--frame-gap': '18px',
      '--header-height': `${headerHeight}px`,
      '--frame-sticky-top': 'calc(var(--shell-padding) + var(--header-height, 100px) + var(--frame-gap))'
    }),
    [appearance, headerHeight]
  );

  const toggleMobilePanel = useCallback((panel: Exclude<MobilePanel, 'closed'>) => {
    setMobileQuickNavOpen(false);
    setMobilePanel((current) => (current === panel ? 'closed' : panel));
  }, []);

  const closeMobilePanel = useCallback(() => {
    setMobilePanel('closed');
  }, []);

  const mobileContextButtonLabel = isReaderRoute ? '大纲' : isLibraryRoute ? '信息' : '精选';
  const mobileContextPanelLabel = isReaderRoute ? '文档大纲' : isLibraryRoute ? '资料信息' : '推荐阅读';
  const mobileAppearancePanel = (
    <AppearanceControl
      renderVariant="panel"
      appearance={appearance}
      onThemeChange={(themeId) => setAppearance((current) => ({ ...current, themeId }))}
      onFontScaleChange={(fontScale) => setAppearance((current) => ({ ...current, fontScale }))}
    />
  );

  return (
    <div className={`app-shell ${mobilePanel !== 'closed' ? 'has-mobile-panel' : ''}`.trim()} style={shellStyle}>
      <header ref={headerRef} className={`app-header ${headerCompressed ? 'is-scrolled' : ''}`.trim()}>
        <div className="header-brand">
          <div className="section-kicker">Archive Showcase</div>
          <h1>AI 主导学习平台文档展台</h1>
        </div>
        <div className="header-actions">
          <nav className="top-nav">
            <NavLink to="/">总览</NavLink>
            <NavLink to="/library">资料库</NavLink>
          </nav>
          <AppearanceControl
            className="appearance-control--desktop"
            appearance={appearance}
            onThemeChange={(themeId) => setAppearance((current) => ({ ...current, themeId }))}
            onFontScaleChange={(fontScale) => setAppearance((current) => ({ ...current, fontScale }))}
          />
        </div>
        <nav className="mobile-top-nav">
          <NavLink to="/">总览</NavLink>
          <NavLink to="/library">资料库</NavLink>
        </nav>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <Frame
              left={
                <CatalogSidebar
                  activeId={undefined}
                  search={search}
                  onSearchChange={setSearch}
                  layerFilter={layerFilter}
                  onLayerChange={setLayerFilter}
                  items={filteredCatalog}
                  onLinkSelect={closeMobilePanel}
                />
              }
              right={<HomeAside recentItems={recentItems} onLinkSelect={closeMobilePanel} />}
              mobilePanel={mobilePanel}
              onCloseMobilePanel={closeMobilePanel}
              mobileAppearance={mobileAppearancePanel}
              mobileContextLabel={mobileContextPanelLabel}
            >
              <HomePage recentItems={recentItems} onZoom={setLightbox} />
            </Frame>
          }
        />
        <Route
          path="/library"
          element={
            <Frame
              left={
                <CatalogSidebar
                  activeId={undefined}
                  search={search}
                  onSearchChange={setSearch}
                  layerFilter={layerFilter}
                  onLayerChange={setLayerFilter}
                  items={filteredCatalog}
                  onLinkSelect={closeMobilePanel}
                />
              }
              right={<LibraryAside filteredCatalog={filteredCatalog} />}
              mobilePanel={mobilePanel}
              onCloseMobilePanel={closeMobilePanel}
              mobileAppearance={mobileAppearancePanel}
              mobileContextLabel={mobileContextPanelLabel}
            >
              <LibraryPage items={filteredCatalog} onZoom={setLightbox} />
            </Frame>
          }
        />
        <Route
          path="/read/:id"
          element={
            <ReaderRoute
              search={search}
              onSearchChange={setSearch}
              layerFilter={layerFilter}
              onLayerChange={setLayerFilter}
              items={filteredCatalog}
              rememberResource={rememberResource}
              onZoom={setLightbox}
              mobilePanel={mobilePanel}
              onCloseMobilePanel={closeMobilePanel}
              mobileAppearance={mobileAppearancePanel}
              mobileContextLabel={mobileContextPanelLabel}
              themeId={appearance.themeId}
            />
          }
        />
      </Routes>

      {mobileQuickNavOpen ? (
        <button
          type="button"
          className="mobile-actions-backdrop"
          aria-label="关闭快捷导航"
          onClick={() => setMobileQuickNavOpen(false)}
        />
      ) : null}
      <div className={`mobile-actions ${mobileQuickNavOpen ? 'is-open' : ''}`.trim()} aria-label="移动端快捷入口">
        <button
          type="button"
          className="mobile-actions-trigger"
          aria-label={mobileQuickNavOpen ? '收起快捷导航' : '打开快捷导航'}
          aria-expanded={mobileQuickNavOpen}
          onClick={() => setMobileQuickNavOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="mobile-actions-menu" aria-hidden={!mobileQuickNavOpen}>
          <div className="mobile-actions-brand">
            <div className="section-kicker">Archive Showcase</div>
            <strong>AI 主导学习平台文档展台</strong>
          </div>
          <nav className="mobile-actions-nav">
            <NavLink to="/" onClick={() => setMobileQuickNavOpen(false)}>
              总览
            </NavLink>
            <NavLink to="/library" onClick={() => setMobileQuickNavOpen(false)}>
              资料库
            </NavLink>
          </nav>
          <div className="mobile-actions-shortcuts">
            <button
              type="button"
              className={mobilePanel === 'catalog' ? 'is-active' : ''}
              aria-expanded={mobilePanel === 'catalog'}
              onClick={() => toggleMobilePanel('catalog')}
            >
              目录
            </button>
            <button
              type="button"
              className={mobilePanel === 'context' ? 'is-active' : ''}
              aria-expanded={mobilePanel === 'context'}
              onClick={() => toggleMobilePanel('context')}
            >
              {mobileContextButtonLabel}
            </button>
            <button
              type="button"
              className={mobilePanel === 'appearance' ? 'is-active' : ''}
              aria-expanded={mobilePanel === 'appearance'}
              onClick={() => toggleMobilePanel('appearance')}
            >
              外观
            </button>
          </div>
        </div>
      </div>

      <ZoomLightbox lightbox={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}

interface AppearanceControlProps {
  appearance: AppearanceState;
  onThemeChange: (themeId: ThemeId) => void;
  onFontScaleChange: (fontScale: FontScaleId) => void;
  compact?: boolean;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  renderVariant?: 'popover' | 'panel';
}

function AppearanceControl({
  appearance,
  onThemeChange,
  onFontScaleChange,
  compact = false,
  className = '',
  open,
  onOpenChange,
  renderVariant = 'popover'
}: AppearanceControlProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const activeTheme = getThemePreset(appearance.themeId);
  const isControlled = typeof open === 'boolean';
  const isOpen = renderVariant === 'panel' ? true : isControlled ? open : internalOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  useEffect(() => {
    if (renderVariant === 'popover' && !isControlled) {
      setInternalOpen(false);
    }
  }, [isControlled, location.pathname, renderVariant]);

  useEffect(() => {
    if (renderVariant !== 'popover' || !isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, renderVariant, setOpen]);

  const panelContent = (
    <div className={`appearance-popover ${renderVariant === 'panel' ? 'appearance-popover--panel' : ''}`.trim()}>
      <div className="appearance-popover-header">
        <div className="section-kicker">Reading Setup</div>
        <h3>阅读外观</h3>
        <p>切换护眼底色和阅读字号，首页、资料库和阅读页会保持一致。</p>
      </div>

      <div className="appearance-section">
        <div className="appearance-section-head">
          <strong>护眼背景</strong>
          <span>{activeTheme.tone}</span>
        </div>
        <div className="theme-grid">
          {THEME_PRESETS.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`theme-option ${appearance.themeId === theme.id ? 'is-active' : ''}`.trim()}
              onClick={() => onThemeChange(theme.id)}
              aria-pressed={appearance.themeId === theme.id}
            >
              <span className="theme-option-swatches">
                {theme.swatches.map((color) => (
                  <span key={color} style={{ background: color }} />
                ))}
              </span>
              <span className="theme-option-copy">
                <strong>{theme.label}</strong>
                <small>{theme.tone}</small>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="appearance-section">
        <div className="appearance-section-head">
          <strong>正文字号</strong>
          <span>{FONT_SCALE_PRESETS.find((item) => item.id === appearance.fontScale)?.hint}</span>
        </div>
        <div className="font-scale-row">
          {FONT_SCALE_PRESETS.map((scale) => (
            <button
              key={scale.id}
              type="button"
              className={`font-scale-option ${appearance.fontScale === scale.id ? 'is-active' : ''}`.trim()}
              onClick={() => onFontScaleChange(scale.id)}
              aria-pressed={appearance.fontScale === scale.id}
            >
              <strong>{scale.label}</strong>
              <span>{scale.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (renderVariant === 'panel') {
    return <div className={`appearance-control ${className}`.trim()}>{panelContent}</div>;
  }

  return (
    <div ref={rootRef} className={`appearance-control ${className}`.trim()}>
      <button
        type="button"
        className={`appearance-trigger ${isOpen ? 'is-open' : ''}`.trim()}
        onClick={() => setOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="appearance-trigger-dot" />
        <span>{compact ? '外观' : `阅读外观 · ${activeTheme.label}`}</span>
      </button>

      {isOpen ? panelContent : null}
    </div>
  );
}

interface FrameProps {
  left: ReactNode;
  children: ReactNode;
  right: ReactNode;
  mobilePanel: MobilePanel;
  onCloseMobilePanel: () => void;
  mobileAppearance: ReactNode;
  mobileContextLabel: string;
  mode?: 'default' | 'reader';
}

function Frame({
  left,
  children,
  right,
  mobilePanel,
  onCloseMobilePanel,
  mobileAppearance,
  mobileContextLabel,
  mode = 'default'
}: FrameProps) {
  const mobileContent =
    mobilePanel === 'catalog' ? left : mobilePanel === 'context' ? right : mobilePanel === 'appearance' ? mobileAppearance : null;

  return (
    <>
      <div className={`frame-grid ${mode === 'reader' ? 'frame-grid--reader' : ''}`.trim()}>
        <aside className="frame-left">{left}</aside>
        <main className="frame-main">{children}</main>
        <aside className="frame-right">{right}</aside>
      </div>

      {mobilePanel !== 'closed' && mobileContent ? (
        <>
          <button type="button" className="mobile-panel-backdrop" aria-label="关闭面板" onClick={onCloseMobilePanel} />
          <section
            className="mobile-panel-shell"
            data-panel={mobilePanel}
            role="dialog"
            aria-modal="true"
            aria-label={mobilePanel === 'catalog' ? '资料目录' : mobilePanel === 'appearance' ? '阅读外观' : mobileContextLabel}
          >
            <button type="button" className="mobile-panel-close" onClick={onCloseMobilePanel}>
              关闭
            </button>
            <div className="mobile-panel-scroll">{mobileContent}</div>
          </section>
        </>
      ) : null}
    </>
  );
}

interface CatalogSidebarProps {
  activeId?: string;
  search: string;
  onSearchChange: (value: string) => void;
  layerFilter: Layer | '全部';
  onLayerChange: (value: Layer | '全部') => void;
  items: CatalogItem[];
  onLinkSelect?: () => void;
}

function CatalogSidebar({
  activeId,
  search,
  onSearchChange,
  layerFilter,
  onLayerChange,
  items,
  onLinkSelect
}: CatalogSidebarProps) {
  const grouped = useMemo(
    () =>
      topLevelLayers.map((layer) => ({
        layer,
        items: items.filter((item) => item.layer === layer)
      })),
    [items]
  );

  return (
    <div className="sidebar-panel">
      <div className="panel-header">
        <div className="section-kicker">馆藏目录</div>
        <h2>资料导航</h2>
      </div>
      <label className="search-field">
        <span>搜索</span>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="按标题、路径或正文搜索"
        />
      </label>
      <div className="filter-strip">
        <button
          type="button"
          className={layerFilter === '全部' ? 'is-active' : ''}
          onClick={() => onLayerChange('全部')}
        >
          全部
        </button>
        {topLevelLayers.map((layer) => (
          <button
            key={layer}
            type="button"
            className={layerFilter === layer ? 'is-active' : ''}
            onClick={() => onLayerChange(layer)}
          >
            {layer}
          </button>
        ))}
      </div>

      <div className="layer-tree">
        {grouped.map(({ layer, items: layerItems }) => (
          <details key={layer} open={layer !== '归档'}>
            <summary>
              <span>{layer}</span>
              <span>{layerItems.length}</span>
            </summary>
            <div className="tree-items">
              {layerItems.map((item) => (
                <Link
                  key={item.id}
                  className={`tree-item ${activeId === item.id ? 'is-active' : ''}`}
                  to={`/read/${item.id}`}
                  onClick={onLinkSelect}
                >
                  <span>{item.title}</span>
                  <small>{item.group}</small>
                </Link>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function HomeAside({ recentItems, onLinkSelect }: { recentItems: CatalogItem[]; onLinkSelect?: () => void }) {
  return (
    <div className="aside-panel">
      <div className="panel-header">
        <div className="section-kicker">快速入口</div>
        <h2>推荐阅读</h2>
      </div>
      <div className="aside-list">
        {featuredResources.map((item) => (
          <Link key={item.id} className="aside-link" to={`/read/${item.id}`} onClick={onLinkSelect}>
            <strong>{item.title}</strong>
            <span>{item.layer}</span>
          </Link>
        ))}
      </div>
      <div className="panel-header panel-header--spaced">
        <div className="section-kicker">最近查看</div>
        <h2>阅读轨迹</h2>
      </div>
      <div className="aside-list">
        {recentItems.length ? (
          recentItems.map((item) => (
            <Link key={item.id} className="aside-link" to={`/read/${item.id}`} onClick={onLinkSelect}>
              <strong>{item.title}</strong>
              <span>{item.relativePath}</span>
            </Link>
          ))
        ) : (
          <div className="empty-state">打开一份文档后，这里会记录你的最近查看。</div>
        )}
      </div>
    </div>
  );
}

function LibraryAside({ filteredCatalog }: { filteredCatalog: CatalogItem[] }) {
  const counts = useMemo(
    () =>
      topLevelLayers.map((layer) => ({
        layer,
        count: filteredCatalog.filter((item) => item.layer === layer).length
      })),
    [filteredCatalog]
  );

  return (
    <div className="aside-panel">
      <div className="panel-header">
        <div className="section-kicker">资料分层</div>
        <h2>当前筛选统计</h2>
      </div>
      <div className="count-list">
        {counts.map(({ layer, count }) => (
          <div key={layer} className="count-row">
            <span>{layer}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>
      <p className="aside-note">
        主文档层优先展示，归档默认弱化。图像资源单独成组，适合答辩时直接打开细节查看。
      </p>
    </div>
  );
}

function HomePage({ recentItems }: { recentItems: CatalogItem[]; onZoom: (lightbox: LightboxState) => void }) {
  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="section-kicker">Archive Reading Desk</div>
          <h2>把平台文档、比赛资料、PDF 和学科图像放进同一个展示舞台。</h2>
          <p>
            这不是普通文档站，而是一套面向比赛展示的档案馆式阅读台：主线文档优先、归档后置、
            图片可沉浸放大、PDF 可分页查看。
          </p>
          <div className="hero-actions">
            <Link to="/library">进入资料库</Link>
            {featuredResources[0] ? <Link to={`/read/${featuredResources[0].id}`}>从平台总纲开始</Link> : null}
          </div>
        </div>
        <div className="hero-media hero-media--docs">
          {featuredResources.map((item) => (
            <Link key={item.id} to={`/read/${item.id}`} className="hero-doc">
              <div className="section-kicker">{item.layer}</div>
              <strong>{item.title}</strong>
              <span>{item.group}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="shelf-section">
        <div className="section-header">
          <div className="section-kicker">策展入口</div>
          <h2>建议从这几份资料进入</h2>
        </div>
        <div className="shelf-list">
          {featuredResources.map((item) => (
            <Link key={item.id} to={`/read/${item.id}`} className="shelf-link">
              <strong>{item.title}</strong>
              <span>
                {item.layer} · {item.group}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="shelf-section">
        <div className="section-header">
          <div className="section-kicker">最近查看</div>
          <h2>继续你的阅读路径</h2>
        </div>
        <div className="shelf-list">
          {recentItems.length ? (
            recentItems.map((item) => (
              <Link key={item.id} to={`/read/${item.id}`} className="shelf-link">
                <strong>{item.title}</strong>
                <span>{item.relativePath}</span>
              </Link>
            ))
          ) : (
            <div className="empty-state">你还没有打开任何文档，可以先从平台总纲或高等数学示范进入。</div>
          )}
        </div>
      </section>
    </div>
  );
}

function LibraryPage({ items }: { items: CatalogItem[]; onZoom: (lightbox: LightboxState) => void }) {
  const grouped = useMemo(
    () =>
      topLevelLayers
        .map((layer) => ({
          layer,
          items: items.filter((item) => item.layer === layer)
        }))
        .filter((group) => group.items.length > 0),
    [items]
  );

  return (
    <div className="page-stack">
      <section className="section-header section-header--page">
        <div className="section-kicker">Library</div>
        <h2>全部资料</h2>
        <p>主文档、归档、比赛 PDF 和腾讯平台资料在这里统一浏览，图像资源收敛到相关文档页内部展示。</p>
      </section>

      {grouped.map(({ layer, items: layerItems }) => (
        <section key={layer} className="library-section">
          <div className="section-header">
            <div className="section-kicker">{layer}</div>
            <h2>{layer}</h2>
          </div>

          <div className="resource-list">
            {layerItems.map((item) => (
              <Link key={item.id} to={`/read/${item.id}`} className="resource-row">
                <div>
                  <div className="section-kicker">{item.group}</div>
                  <strong>{item.title}</strong>
                </div>
                <span>{item.type.toUpperCase()}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

interface ReaderRouteProps {
  search: string;
  onSearchChange: (value: string) => void;
  layerFilter: Layer | '全部';
  onLayerChange: (value: Layer | '全部') => void;
  items: CatalogItem[];
  rememberResource: (item: CatalogItem) => void;
  onZoom: (lightbox: LightboxState) => void;
  mobilePanel: MobilePanel;
  onCloseMobilePanel: () => void;
  mobileAppearance: ReactNode;
  mobileContextLabel: string;
  themeId: ThemeId;
}

function ReaderRoute(props: ReaderRouteProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = id ? catalogById.get(id) : undefined;

  useEffect(() => {
    if (!item) {
      navigate('/');
      return;
    }
    props.rememberResource(item);
  }, [item, navigate, props.rememberResource]);

  if (!item) {
    return null;
  }

  const outline = extractOutline(item.rawText);
  const related = getRelatedResources(item);
  const images = getImageResourcesForItem(item);

  return (
    <Frame
      mode="reader"
      key={item.id}
      left={
        <CatalogSidebar
          activeId={item.id}
          search={props.search}
          onSearchChange={props.onSearchChange}
          layerFilter={props.layerFilter}
          onLayerChange={props.onLayerChange}
          items={props.items}
          onLinkSelect={props.onCloseMobilePanel}
        />
      }
      right={
        <ReaderAside
          item={item}
          outline={outline}
          related={related}
          images={images}
          onZoom={props.onZoom}
          onLinkSelect={props.onCloseMobilePanel}
        />
      }
      mobilePanel={props.mobilePanel}
      onCloseMobilePanel={props.onCloseMobilePanel}
      mobileAppearance={props.mobileAppearance}
      mobileContextLabel={props.mobileContextLabel}
    >
      <ReaderPage key={item.id} item={item} onZoom={props.onZoom} themeId={props.themeId} />
    </Frame>
  );
}

function ReaderAside({
  item,
  outline,
  related,
  images,
  onZoom,
  onLinkSelect
}: {
  item: CatalogItem;
  outline: ReturnType<typeof extractOutline>;
  related: CatalogItem[];
  images: CatalogItem[];
  onZoom: (lightbox: LightboxState) => void;
  onLinkSelect?: () => void;
}) {
  return (
    <div className="aside-panel">
      <div className="panel-header">
        <div className="section-kicker">当前文档</div>
        <h2>{item.title}</h2>
      </div>
      <div className="meta-stack">
        <div className="count-row">
          <span>层级</span>
          <strong>{item.layer}</strong>
        </div>
        <div className="count-row">
          <span>分组</span>
          <strong>{item.group}</strong>
        </div>
        <div className="count-row">
          <span>类型</span>
          <strong>{item.type}</strong>
        </div>
      </div>

      {outline.length ? (
        <>
          <div className="panel-header panel-header--spaced">
            <div className="section-kicker">文档大纲</div>
            <h2>快速跳转</h2>
          </div>
          <div className="outline-list">
            {outline.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={`outline-link level-${entry.level}`}
                onClick={() => {
                  document.getElementById(entry.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  onLinkSelect?.();
                }}
              >
                {entry.text}
              </button>
            ))}
          </div>
        </>
      ) : null}

      <div className="panel-header panel-header--spaced">
        <div className="section-kicker">相关资源</div>
        <h2>继续阅读</h2>
      </div>
      <div className="aside-list">
        {related.map((resource) => (
          <Link key={resource.id} className="aside-link" to={`/read/${resource.id}`} onClick={onLinkSelect}>
            <strong>{resource.title}</strong>
            <span>
              {resource.layer} · {resource.group}
            </span>
          </Link>
        ))}
      </div>

      {images.length ? (
        <>
          <div className="panel-header panel-header--spaced">
            <div className="section-kicker">关联图像</div>
            <h2>一键放大</h2>
          </div>
          <div className="mini-figure-list">
            {images.map((image) => (
              <button
                key={image.id}
                type="button"
                className="mini-figure"
                onClick={() => {
                  onLinkSelect?.();
                  onZoom({ src: image.assetUrl ?? '', title: image.title });
                }}
              >
                <img src={image.assetUrl} alt={image.title} />
                <span>{image.title}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function ReaderPage({
  item,
  onZoom,
  themeId
}: {
  item: CatalogItem;
  onZoom: (lightbox: LightboxState) => void;
  themeId: ThemeId;
}) {
  return (
    <div className="page-stack">
      <section className="reader-header">
        <div>
          <div className="section-kicker">
            {item.layer} · {item.group}
          </div>
          <h2>{item.title}</h2>
          <p>{item.relativePath}</p>
        </div>
        {item.assetUrl ? (
          <div className="toolbar-actions">
            <a href={item.assetUrl} target="_blank" rel="noreferrer">
              原文件打开
            </a>
          </div>
        ) : null}
      </section>

      {item.type === 'markdown' ? <MarkdownArticle item={item} onOpenLightbox={onZoom} themeId={themeId} /> : null}
      {item.type === 'pdf' && item.assetUrl ? <PdfViewer src={item.assetUrl} title={item.title} /> : null}
      {item.type === 'image' && item.assetUrl ? (
        <section className="image-reader">
          <div className="reader-toolbar">
            <div>
              <div className="section-kicker">图像详情</div>
              <h2>{item.title}</h2>
            </div>
            <div className="toolbar-actions">
              <button type="button" onClick={() => onZoom({ src: item.assetUrl ?? '', title: item.title })}>
                放大查看
              </button>
              <a href={item.assetUrl} target="_blank" rel="noreferrer">
                原文件打开
              </a>
            </div>
          </div>

          <div className="image-stage">
            <img className="document-image" src={item.assetUrl} alt={item.title} />
          </div>

          <p className="image-note">
            当前详情页使用完整展示，不做封面式裁切；当视口较小时，由阅读区滚动，不让图片底部说明被遮挡。
          </p>
        </section>
      ) : null}
    </div>
  );
}

export default App;
