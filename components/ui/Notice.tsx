import { AlertTriangle, Info } from 'lucide-react';
import type { ReactNode } from 'react';

export function Notice({
  tone = 'danger',
  children,
  action,
}: {
  tone?: 'danger' | 'info';
  children: ReactNode;
  action?: ReactNode;
}) {
  const Icon = tone === 'danger' ? AlertTriangle : Info;
  return (
    <div className="notice" data-tone={tone} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon className="notice__icon" size={18} aria-hidden="true" />
      <span className="notice__copy">{children}</span>
      {action}
    </div>
  );
}
