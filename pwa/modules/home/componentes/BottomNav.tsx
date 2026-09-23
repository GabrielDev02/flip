import Link from "next/link";

export type NavPath = "home" | "transacoes" | "metas" | "ajustes";

interface NavItem {
  path: NavPath;
  icon: string;
  label: string;
  href?: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: "home", icon: "dashboard", label: "Home", href: "/app/home" },
  { path: "transacoes", icon: "receipt_long", label: "Transações", href: "/app/transacoes" },
  { path: "metas", icon: "savings", label: "Metas" },
  { path: "ajustes", icon: "tune", label: "Ajustes" },
];

interface BottomNavProps {
  active?: NavPath;
}

export function BottomNav({ active = "home" }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-4px_24px_rgba(26,26,26,0.06)]">
      <div className="flex items-center justify-around h-16 px-space-sm">
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === active;
          return (
            <Link
              key={item.path}
              href={item.href ?? "#"}
              aria-current={isActive ? "page" : undefined}
              title={item.href ? undefined : "Em breve"}
              className={`flex flex-col items-center justify-center min-w-[64px] h-12 transition-colors ${
                isActive ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className={`text-label-sm mt-1 ${isActive ? "font-bold" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
