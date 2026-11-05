import Link from 'next/link';
import { BrandMark } from './icons/BrandMark';

export type AppHeaderProps = {
  eyebrow?: string;
  current?: 'home' | 'system' | 'production';
};

export function AppHeader({eyebrow = 'Household / Overview', current}: AppHeaderProps) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/" aria-current={current === 'home' ? 'page' : undefined}>
          <span className="brand__mark">
            <BrandMark />
          </span>
          <span className="brand__wordmark">pantrypilot</span>
        </Link>
        <div className="site-header__nav">
          <p className="eyebrow">{eyebrow}</p>
          <nav className="site-header__nav" aria-label="Primary">
            <Link
              className="site-header__link"
              href="/production"
              aria-current={current === 'production' ? 'page' : undefined}
            >
              Production
            </Link>
            <Link
              className="site-header__link"
              href="/design-system"
              aria-current={current === 'system' ? 'page' : undefined}
            >
              Design system
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
