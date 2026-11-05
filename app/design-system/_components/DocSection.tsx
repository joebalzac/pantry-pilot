import type { ReactNode } from 'react';

export type DocSectionProps = {
  /** Anchor target for the table of contents. */
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function DocSection({id, eyebrow, title, description, children}: DocSectionProps) {
  const titleId = `${id}-title`;
  return (
    <section className="ds-section" id={id} aria-labelledby={titleId}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="heading-lg" id={titleId}>
        {title}
      </h2>
      {description ? <p className="caption">{description}</p> : null}
      {children}
    </section>
  );
}
