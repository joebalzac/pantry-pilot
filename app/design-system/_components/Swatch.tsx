import type { CssVar } from '../../../lib/tokens';

export function Swatch({token}: {token: CssVar}) {
  return (
    <figure className="ds-swatch">
      {/* Inline because the color is the data being documented, not a styling choice. */}
      <div className="ds-swatch__chip" style={{background: `var(${token})`}} />
      <figcaption>
        <code>{token.replace('--', '')}</code>
      </figcaption>
    </figure>
  );
}
