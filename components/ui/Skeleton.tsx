import type { CSSProperties } from 'react';

export function Skeleton({shape = 'line', width}: {shape?: 'line' | 'well'; width?: CSSProperties['width']}) {
  return <span className="skeleton" data-shape={shape} style={{width}} aria-hidden="true" />;
}

const TITLE_WIDTHS = ['48%', '62%', '38%', '55%'];

export function ItemRowSkeleton({rows = 4, label = 'Loading items'}: {rows?: number; label?: string}) {
  return (
    <div role="status">
      {Array.from({length: rows}, (_, index) => (
        <div key={index} className="item-row">
          <Skeleton shape="well" />
          <div className="item-row__body">
            <Skeleton width={TITLE_WIDTHS[index % TITLE_WIDTHS.length]} />
            <Skeleton width="28%" />
          </div>
        </div>
      ))}
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
