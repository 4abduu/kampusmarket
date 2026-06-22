import type { ReactNode } from "react";

interface DetailBreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface DetailPageShellProps {
  breadcrumbs: DetailBreadcrumbItem[];
  mainContent: ReactNode;
  sidebarContent: ReactNode;
  topContent?: ReactNode;
  bottomContent?: ReactNode;
}

export default function DetailPageShell({
  breadcrumbs,
  mainContent,
  sidebarContent,
  topContent,
  bottomContent,
}: DetailPageShellProps) {
  const lastIndex = breadcrumbs.length - 1;

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-slate-50 dark:bg-slate-900/50">
      {topContent}

      <div className="container mx-auto px-4 py-5 sm:py-8">
        <nav className="mb-4 sm:mb-6 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto whitespace-nowrap [scrollbar-width:none] [ms-overflow-style:none]">
          {breadcrumbs.map((item, index) => {
            const isLast = index === lastIndex;

            return (
              <div key={`${item.label}-${index}`} className="flex items-center gap-2">
                {item.onClick && !isLast ? (
                  <button onClick={item.onClick} className="hover:text-primary-600">
                    {item.label}
                  </button>
                ) : (
                  <span className={isLast ? "text-foreground" : undefined}>{item.label}</span>
                )}

                {!isLast && <span>/</span>}
              </div>
            );
          })}
        </nav>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {mainContent}
          </div>
          <div className="pb-[calc(var(--bottom-nav-h)+4.5rem)] lg:pb-0">
            {sidebarContent}
          </div>
        </div>

        {bottomContent}
      </div>
    </div>
  );
}