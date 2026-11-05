import type { ComponentPropsWithoutRef, ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import type { CardPadding } from '../../lib/tokens';

export type CardProps = ComponentPropsWithoutRef<'section'> & {
  as?: 'section' | 'article' | 'div';
  padding?: CardPadding;
};

export function Card({as: Tag = 'section', padding = 'md', className, ...props}: CardProps) {
  return <Tag {...props} className={cn('card', className)} data-padding={padding} />;
}

export type CardHeaderProps = Omit<ComponentPropsWithRef<'div'>, 'title' | 'children'> & {
  eyebrow?: string;
  title: string;
  /** Match the surrounding document outline. Visual size does not change. */
  titleAs?: 'h2' | 'h3' | 'h4';
  action?: ReactNode;
};

export function CardHeader({
  eyebrow,
  title,
  titleAs: Title = 'h2',
  action,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div {...props} className={cn('card__header', className)}>
      <div className="card__header-copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <Title className="card__title heading-lg">{title}</Title>
      </div>
      {action}
    </div>
  );
}
