import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  catalog,
  catalogById,
  extractOutline,
  featuredResources,
  getImageResourcesForItem,
  getRelatedResources,
  searchCatalog,
  topLevelLayers
} from './catalog';
import { FigurePreviewCard } from './components/FigurePreviewCard';
import { MarkdownArticle } from './components/MarkdownArticle';
import { PdfViewer } from './components/PdfViewer';
import { ZoomLightbox } from './components/ZoomLightbox';
import type { CatalogItem, Layer, LightboxState } from './types';

const RECENT_KEY = 'doc-showcase-recent';

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileAsideOpen, setMobileAsideOpen] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [recentIds, setRecentIds] = useState<string[]>(() => readRecentIds());
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
    setMobileAsideOpen(false);
  }, [location.pathname]);

  const filteredCatalog = useMemo(
    () => searchCatalog(catalog, search, layerFilter),
    [search, layerFilter]
  );

  const recentItems = useMemo(
    () => recentIds.map((id) => catalogById.get(id)).filter((item): item is CatalogItem => Boolean(item)),
    [recentIds]
  );

  const rememberResource = (item: CatalogItem) => {
    setRecentIds((current) => {
      const next = [item.id, ...current.filter((id) => id !== item.id)].slice(0, 8);
      writeRecentIds(next);
      return next;
    });
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <div className="section-kicker">Archive Showcase</div>
          <h1>AI 主导学习平台文档展台</h1>
        </div>
        <nav className="top-nav">
          <NavLink to="/">总览</NavLink>
          <NavLink to="/library">资料库</NavLink>
        </nav>
        <div className="mobile-actions">
          <button type="button" onClick={() => setMobileNavOpen((value) => !value)}>
            目录
          </button>
          <button type="button" onClick={() => setMobileAsideOpen((value) => !value)}>
            侧栏
          </button>
        </div>
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
                />
              }
              right={<HomeAside recentItems={recentItems} />}
              mobileNavOpen={mobileNavOpen}
              mobileAsideOpen={mobileAsideOpen}
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
                />
              }
              right={<LibraryAside filteredCatalog={filteredCatalog} />}
              mobileNavOpen={mobileNavOpen}
              mobileAsideOpen={mobileAsideOpen}
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
              mobileNavOpen={mobileNavOpen}
              mobileAsideOpen={mobileAsideOpen}
            />
          }
        />
      </Routes>

      <ZoomLightbox lightbox={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}

interface FrameProps {
  left: ReactNode;
  children: ReactNode;
  right: ReactNode;
  mobileNavOpen: boolean;
  mobileAsideOpen: boolean;
}

function Frame({ left, children, right, mobileNavOpen, mobileAsideOpen }: FrameProps) {
  return (
    <div className="frame-grid">
      <aside className={`frame-left ${mobileNavOpen ? 'is-open' : ''}`}>{left}</aside>
      <main className="frame-main">{children}</main>
      <aside className={`frame-right ${mobileAsideOpen ? 'is-open' : ''}`}>{right}</aside>
    </div>
  );
}

interface CatalogSidebarProps {
  activeId?: string;
  search: string;
  onSearchChange: (value: string) => void;
  layerFilter: Layer | '全部';
  onLayerChange: (value: Layer | '全部') => void;
  items: CatalogItem[];
}

function CatalogSidebar({
  activeId,
  search,
  onSearchChange,
  layerFilter,
  onLayerChange,
  items
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

function HomeAside({ recentItems }: { recentItems: CatalogItem[] }) {
  return (
    <div className="aside-panel">
      <div className="panel-header">
        <div className="section-kicker">快速入口</div>
        <h2>推荐阅读</h2>
      </div>
      <div className="aside-list">
        {featuredResources.map((item) => (
          <Link key={item.id} className="aside-link" to={`/read/${item.id}`}>
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
            <Link key={item.id} className="aside-link" to={`/read/${item.id}`}>
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

function HomePage({
  recentItems,
  onZoom
}: {
  recentItems: CatalogItem[];
  onZoom: (lightbox: LightboxState) => void;
}) {
  const heroImages = catalog.filter((item) => item.layer === '图像资源').slice(0, 3);

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
        <div className="hero-media">
          {heroImages.map((item) => (
            <button
              key={item.id}
              type="button"
              className="hero-image"
              onClick={() => onZoom({ src: item.assetUrl ?? '', title: item.title })}
            >
              <img src={item.assetUrl} alt={item.title} />
              <span>{item.title}</span>
            </button>
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

function LibraryPage({
  items,
  onZoom
}: {
  items: CatalogItem[];
  onZoom: (lightbox: LightboxState) => void;
}) {
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
        <p>主文档、归档、比赛 PDF、腾讯平台资料和图像资源都在这里统一浏览。</p>
      </section>

      {grouped.map(({ layer, items: layerItems }) => (
        <section key={layer} className="library-section">
          <div className="section-header">
            <div className="section-kicker">{layer}</div>
            <h2>{layer}</h2>
          </div>

          {layer === '图像资源' ? (
            <div className="figure-grid">
              {layerItems.map((item) => (
                <FigurePreviewCard
                  key={item.id}
                  item={item}
                  onZoom={(catalogItem) => onZoom({ src: catalogItem.assetUrl ?? '', title: catalogItem.title })}
                />
              ))}
            </div>
          ) : (
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
          )}
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
  mobileNavOpen: boolean;
  mobileAsideOpen: boolean;
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
      left={
        <CatalogSidebar
          activeId={item.id}
          search={props.search}
          onSearchChange={props.onSearchChange}
          layerFilter={props.layerFilter}
          onLayerChange={props.onLayerChange}
          items={props.items}
        />
      }
      right={<ReaderAside item={item} outline={outline} related={related} images={images} onZoom={props.onZoom} />}
      mobileNavOpen={props.mobileNavOpen}
      mobileAsideOpen={props.mobileAsideOpen}
    >
      <ReaderPage item={item} onZoom={props.onZoom} />
    </Frame>
  );
}

function ReaderAside({
  item,
  outline,
  related,
  images,
  onZoom
}: {
  item: CatalogItem;
  outline: ReturnType<typeof extractOutline>;
  related: CatalogItem[];
  images: CatalogItem[];
  onZoom: (lightbox: LightboxState) => void;
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
                onClick={() => document.getElementById(entry.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
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
          <Link key={resource.id} className="aside-link" to={`/read/${resource.id}`}>
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
                onClick={() => onZoom({ src: image.assetUrl ?? '', title: image.title })}
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
  onZoom
}: {
  item: CatalogItem;
  onZoom: (lightbox: LightboxState) => void;
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

      {item.type === 'markdown' ? <MarkdownArticle item={item} onOpenLightbox={onZoom} /> : null}
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
