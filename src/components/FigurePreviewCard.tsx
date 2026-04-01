import { Link } from 'react-router-dom';
import type { CatalogItem } from '../types';

interface FigurePreviewCardProps {
  item: CatalogItem;
  onZoom: (item: CatalogItem) => void;
}

export function FigurePreviewCard({ item, onZoom }: FigurePreviewCardProps) {
  return (
    <article className="figure-card">
      <Link className="figure-card-link" to={`/read/${item.id}`} aria-label={`打开 ${item.title}`}>
        <img className="figure-card-image" src={item.assetUrl} alt={item.title} />
      </Link>
      <div className="figure-card-meta">
        <div>
          <div className="section-kicker">图像资源</div>
          <h3>{item.title}</h3>
        </div>
        <div className="figure-card-actions">
          <Link to={`/read/${item.id}`}>查看详情</Link>
          <button type="button" onClick={() => onZoom(item)}>
            放大
          </button>
        </div>
      </div>
    </article>
  );
}
