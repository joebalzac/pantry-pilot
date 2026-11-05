import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

export function ErrorState({
  icon = <AlertTriangle size={22} />,
  title,
  children,
  actions,
  reference,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  reference?: string;
}) {
  return (
    <div className="error-state" role="alert">
      <div className="error-state__icon">{icon}</div>
      <p className="error-state__title">{title}</p>
      {children ? <p className="error-state__copy">{children}</p> : null}
      {actions ? <div className="error-state__actions">{actions}</div> : null}
      {reference ? <p className="error-state__reference">Reference: {reference}</p> : null}
    </div>
  );
}
