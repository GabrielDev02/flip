interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: "home", icon: "dashboard", label: "Home" },
  { path: "transacoes", icon: "receipt_long", label: "Transações" },
  { path: "metas", icon: "savings", label: "Metas" },
  { path: "ajustes", icon: "tune", label: "Ajustes" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_-4px_24px_rgba(26,26,26,0.06)]">
      <div className="flex items-center justify-around h-16 px-space-sm">
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === "home";
          return (
            <a
              key={item.path}
              href="#"
              aria-current={isActive ? "page" : undefined}
              title={isActive ? undefined : "Em breve"}
              className={`flex flex-col items-center justify-center min-w-[64px] h-12 transition-colors ${
                isActive ? "text-primary font-bold" : "text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
              <span className="text-label-sm mt-1">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
