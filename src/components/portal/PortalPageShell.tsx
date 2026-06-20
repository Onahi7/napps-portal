import type { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface PortalStat {
  label: string;
  value: string;
  helper?: string;
}

interface PortalPageShellProps {
  eyebrow?: string;
  title: string;
  description: string;
  badge?: string;
  icon?: LucideIcon;
  stats?: PortalStat[];
  children: ReactNode;
}

export function PortalPageShell({
  eyebrow,
  title,
  description,
  badge,
  icon: Icon,
  stats = [],
  children,
}: PortalPageShellProps) {
  return (
    <div className="portal-page-shell">
      <section className="portal-hero-surface">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            {eyebrow && <p className="portal-eyebrow">{eyebrow}</p>}
            <div className="flex flex-wrap items-center gap-3">
              {Icon && (
                <div className="portal-icon-wrap">
                  <Icon className="h-6 w-6" />
                </div>
              )}
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h1>
              {badge && <span className="portal-badge">{badge}</span>}
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>

          {stats.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={`${stat.label}-${stat.value}`} className="portal-stat-card">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
                  {stat.helper && (
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{stat.helper}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6">{children}</section>
    </div>
  );
}
