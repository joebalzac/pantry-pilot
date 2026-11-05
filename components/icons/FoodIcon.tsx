import type { ReactNode } from 'react';
import type { FoodIconName } from '../../lib/foodIcons';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_PX: Record<Size, number> = {
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
};

type IconProps = {
  name: FoodIconName;
  size?: Size | number;
  title?: string;
  className?: string;
};

const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const wash = {
  fill: 'currentColor',
  fillOpacity: 0.22,
  stroke: 'none' as const,
};

function Svg({
  title,
  className,
  size,
  children,
}: {
  title?: string;
  className?: string;
  size: number;
  children: ReactNode;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

const ICONS: Record<FoodIconName, ReactNode> = {
  milk: (
    <>
      <path d="M11 12.2 13.6 7.6h4.8L21 12.2V25a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 11 25V12.2Z" {...wash} />
      <path d="M11 12.2 13.6 7.6h4.8L21 12.2V25a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 11 25V12.2Z" {...stroke} />
      <path d="M11 12.2h10" {...stroke} />
      <path d="M16 16.4c0 0 2.1 2.5 2.1 3.8a2.1 2.1 0 1 1-4.2 0c0-1.3 2.1-3.8 2.1-3.8Z" {...stroke} />
    </>
  ),
  butter: (
    <>
      <rect x="8.5" y="13" width="15" height="9.5" rx="2" {...wash} />
      <rect x="8.5" y="13" width="15" height="9.5" rx="2" {...stroke} />
      <path d="M8.5 16.4h15" {...stroke} />
      <ellipse cx="16" cy="10.2" rx="5.2" ry="2.4" {...wash} />
      <ellipse cx="16" cy="10.2" rx="5.2" ry="2.4" {...stroke} />
      <path d="M10 24.8h12" {...stroke} />
    </>
  ),
  eggs: (
    <>
      <ellipse cx="12.4" cy="17.4" rx="4.6" ry="6.6" {...wash} />
      <ellipse cx="12.4" cy="17.4" rx="4.6" ry="6.6" {...stroke} />
      <ellipse cx="19.6" cy="16.2" rx="5" ry="7.2" {...wash} />
      <ellipse cx="19.6" cy="16.2" rx="5" ry="7.2" {...stroke} />
      <ellipse cx="18.2" cy="13.2" rx="1.2" ry="1.8" fill="currentColor" fillOpacity={0.28} />
    </>
  ),
  yogurt: (
    <>
      <path d="M10.5 13h11v8.2a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4V13Z" {...wash} />
      <path d="M10.5 13h11v8.2a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4V13Z" {...stroke} />
      <rect x="9" y="10.5" width="14" height="3.2" rx="1.2" {...stroke} />
      <path d="M13.2 18.2c.7.9 1.6 1.4 2.8 1.4s2.1-.5 2.8-1.4" {...stroke} />
    </>
  ),
  apple: (
    <>
      <path d="M16 11.2c2.2-2.6 5.8-2.2 7.2.6 1.6 3.2.4 8.2-2.6 10.6-1.4 1.1-3 1.6-4.6 1.6s-3.2-.5-4.6-1.6c-3-2.4-4.2-7.4-2.6-10.6 1.4-2.8 5-3.2 7.2-.6Z" {...wash} />
      <path d="M16 11.2c2.2-2.6 5.8-2.2 7.2.6 1.6 3.2.4 8.2-2.6 10.6-1.4 1.1-3 1.6-4.6 1.6s-3.2-.5-4.6-1.6c-3-2.4-4.2-7.4-2.6-10.6 1.4-2.8 5-3.2 7.2-.6Z" {...stroke} />
      <path d="M16 11.4c.2-2.4 1.4-4.4 3.4-5.4" {...stroke} />
      <path d="M16.2 8.6c1.4.2 2.6 1.2 3.2 2.5" {...stroke} />
    </>
  ),
  banana: (
    <>
      <path d="M6.8 19.8c1.8-6.2 6.4-10.4 13.6-11.2" {...stroke} />
      <path d="M9.2 23c2.4-7.4 7.6-12.6 16.2-13.6 1.6-.2 2.6 1.4 2.1 2.8-1.2 4.2-3.6 8.2-8.2 11.6-3.6 2.6-8.2 2.4-10.1-.8Z" {...wash} />
      <path d="M9.2 23c2.4-7.4 7.6-12.6 16.2-13.6 1.6-.2 2.6 1.4 2.1 2.8-1.2 4.2-3.6 8.2-8.2 11.6-3.6 2.6-8.2 2.4-10.1-.8Z" {...stroke} />
      <path d="M25.2 9.6 27.2 7.8" {...stroke} />
      <path d="M13.2 18.6c2.6 1.8 5.8 2.6 9 2.2" {...stroke} />
    </>
  ),
  carrot: (
    <>
      <path d="M13.2 13.4 24.6 24.8c.9.9.4 2.4-.9 2.6-4.2.6-8.6-2.2-11.6-5.2s-5.8-7.4-5.2-11.6c.2-1.3 1.7-1.8 2.6-.9L13.2 13.4Z" {...wash} />
      <path d="M13.2 13.4 24.6 24.8c.9.9.4 2.4-.9 2.6-4.2.6-8.6-2.2-11.6-5.2s-5.8-7.4-5.2-11.6c.2-1.3 1.7-1.8 2.6-.9L13.2 13.4Z" {...stroke} />
      <path d="M13.4 13.2c2.2-3.6 1.4-6.4.2-8.2" {...stroke} />
      <path d="M13.4 13.2c3.6-1.6 6.2-1 8.2.4" {...stroke} />
      <path d="M13.4 13.2c2.8-2.8 5.8-3 8-2.2" {...stroke} />
    </>
  ),
  leafy: (
    <>
      <path d="M16 26.2c0 0-8.4-3.4-8.4-12.2C7.6 8.4 12 6 16 10.4c4-4.4 8.4-2 8.4 3.6 0 8.8-8.4 12.2-8.4 12.2Z" {...wash} />
      <path d="M16 26.2c0 0-8.4-3.4-8.4-12.2C7.6 8.4 12 6 16 10.4c4-4.4 8.4-2 8.4 3.6 0 8.8-8.4 12.2-8.4 12.2Z" {...stroke} />
      <path d="M16 26.2V12.4" {...stroke} />
      <path d="M16 16.4c-2.4-1-4.2-3-5-5.2" {...stroke} />
      <path d="M16 18.2c2.2-.8 4.2-2.6 5.2-4.8" {...stroke} />
    </>
  ),
  avocado: (
    <>
      <path d="M9.2 18.4c0-6 3.2-11.6 6.8-11.6s6.8 5.6 6.8 11.6S19.6 26.8 16 26.8s-6.8-2.4-6.8-8.4Z" {...wash} />
      <path d="M9.2 18.4c0-6 3.2-11.6 6.8-11.6s6.8 5.6 6.8 11.6S19.6 26.8 16 26.8s-6.8-2.4-6.8-8.4Z" {...stroke} />
      <circle cx="16" cy="19.2" r="3.1" fill="currentColor" fillOpacity={0.3} />
      <circle cx="16" cy="19.2" r="3.1" {...stroke} />
    </>
  ),
  steak: (
    <>
      <path d="M7.6 15.2c.4-4 4.2-7.2 9.6-7.2 4.8 0 8.4 2.4 9 5.8.4 2.4-.8 4.4-2.2 6.2-1.8 2.4-4.6 4.2-8.2 4.2-5.6 0-8.6-3.8-8.2-9Z" {...wash} />
      <path d="M7.6 15.2c.4-4 4.2-7.2 9.6-7.2 4.8 0 8.4 2.4 9 5.8.4 2.4-.8 4.4-2.2 6.2-1.8 2.4-4.6 4.2-8.2 4.2-5.6 0-8.6-3.8-8.2-9Z" {...stroke} />
      <path d="M12.4 12.2c1.8 2 2.6 4.6 2.2 7.2" {...stroke} />
      <path d="M18 12.8c1 1.8 1.4 3.8.8 6" {...stroke} />
      <path d="M9.2 13.4c-.8.6-1.2 1.6-1 2.6.4 1.4 1.6 1.8 2.6 1.2" {...stroke} />
    </>
  ),
  chicken: (
    <>
      <path d="M9.4 20.2c2.4-5.6 7.8-9.6 14.2-9.2 1.4.1 2.2 1.6 1.6 2.8-1.4 2.8-3.8 4.6-6.6 6.4l4.4 5.4c.6.8-.2 1.9-1.2 1.7l-5.6-1.2-2.2 4.2c-.5.9-1.8.7-2-.4l-1.2-6.2c-1.8.2-3.4-.4-4.2-1.6-.8-1.2-.2-2.6.8-1.9Z" {...wash} />
      <path d="M9.4 20.2c2.4-5.6 7.8-9.6 14.2-9.2 1.4.1 2.2 1.6 1.6 2.8-1.4 2.8-3.8 4.6-6.6 6.4l4.4 5.4c.6.8-.2 1.9-1.2 1.7l-5.6-1.2-2.2 4.2c-.5.9-1.8.7-2-.4l-1.2-6.2c-1.8.2-3.4-.4-4.2-1.6-.8-1.2-.2-2.6.8-1.9Z" {...stroke} />
      <circle cx="21.6" cy="13.2" r="0.9" fill="currentColor" />
    </>
  ),
  fish: (
    <>
      <path d="M6.8 16.2c2.8-5.4 8.6-8 14.6-6.2 2.2.7 3.4 2.6 3.4 4.8 0 2.2-1.2 4.1-3.4 4.8-6 1.8-11.8-.8-14.6-6.2Z" {...wash} />
      <path d="M6.8 16.2c2.8-5.4 8.6-8 14.6-6.2 2.2.7 3.4 2.6 3.4 4.8 0 2.2-1.2 4.1-3.4 4.8-6 1.8-11.8-.8-14.6-6.2Z" {...stroke} />
      <path d="M24.6 11.4 28.4 9v6.4l-3.8-1.6" {...stroke} />
      <path d="M24.6 20.8 28.4 23v-6.2" {...stroke} />
      <circle cx="11.4" cy="15.4" r="1.05" fill="currentColor" />
      <path d="M16.6 13.2c1 .8 1.6 1.8 1.6 3s-.6 2.2-1.6 3" {...stroke} />
    </>
  ),
  bread: (
    <>
      <path d="M7.6 14.4c0-4 3.6-7 8.4-7s8.4 3 8.4 7v8.2a2.4 2.4 0 0 1-2.4 2.4H10a2.4 2.4 0 0 1-2.4-2.4v-8.2Z" {...wash} />
      <path d="M7.6 14.4c0-4 3.6-7 8.4-7s8.4 3 8.4 7v8.2a2.4 2.4 0 0 1-2.4 2.4H10a2.4 2.4 0 0 1-2.4-2.4v-8.2Z" {...stroke} />
      <path d="M12 12.6c.6-1 1.6-1.6 2.8-1.6" {...stroke} />
      <path d="M17.2 12.4c.6-1 1.6-1.5 2.8-1.5" {...stroke} />
      <path d="M11.6 17.8c.6-1 1.6-1.5 2.8-1.5" {...stroke} />
    </>
  ),
  grain: (
    <>
      <path d="M8.5 14.5h15l-1.2 10.2a2.6 2.6 0 0 1-2.6 2.3H12.3a2.6 2.6 0 0 1-2.6-2.3L8.5 14.5Z" {...wash} />
      <path d="M8.5 14.5h15l-1.2 10.2a2.6 2.6 0 0 1-2.6 2.3H12.3a2.6 2.6 0 0 1-2.6-2.3L8.5 14.5Z" {...stroke} />
      <path d="M7.6 14.5h16.8" {...stroke} />
      <path d="M12.2 8.4c0 2.4 1.6 4.2 3.8 4.2s3.8-1.8 3.8-4.2c-1.4.6-2.6.6-3.8 0-1.2.6-2.4.6-3.8 0Z" {...stroke} />
      <path d="M14.4 19.2h3.2M13.6 22.2h4.8" {...stroke} />
    </>
  ),
  oil: (
    <>
      <path d="M13.2 6.8h5.6v3.2l1.6 2.2V25a2.4 2.4 0 0 1-2.4 2.4h-4a2.4 2.4 0 0 1-2.4-2.4V12.2l1.6-2.2V6.8Z" {...wash} />
      <path d="M13.2 6.8h5.6v3.2l1.6 2.2V25a2.4 2.4 0 0 1-2.4 2.4h-4a2.4 2.4 0 0 1-2.4-2.4V12.2l1.6-2.2V6.8Z" {...stroke} />
      <path d="M13.2 10h5.6" {...stroke} />
      <path d="M14.6 17.4c.8 1.6 1.6 2.4 2.8 2.8" {...stroke} />
    </>
  ),
  bowl: (
    <>
      <path d="M7.4 16.2h17.2c-.4 5.6-3.8 9.4-8.6 9.4s-8.2-3.8-8.6-9.4Z" {...wash} />
      <path d="M7.4 16.2h17.2c-.4 5.6-3.8 9.4-8.6 9.4s-8.2-3.8-8.6-9.4Z" {...stroke} />
      <path d="M12.2 8.4c.4 1.6.2 3.2-.6 4.6" {...stroke} />
      <path d="M16 7.6c.2 1.8 0 3.4-.8 5.2" {...stroke} />
      <path d="M19.8 8.6c.2 1.5 0 3-.6 4.4" {...stroke} />
    </>
  ),
};

export function FoodIcon({name, size = 'md', title, className}: IconProps) {
  const px = typeof size === 'number' ? size : SIZE_PX[size];
  return (
    <Svg size={px} title={title} className={className}>
      {ICONS[name]}
    </Svg>
  );
}
