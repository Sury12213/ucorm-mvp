export type DashboardTab = 'overview' | 'analytics' | 'responses' | 'settings' | 'help';

const navItems: Array<{ id: DashboardTab; label: string; icon: string }> = [
  { id: 'overview', label: 'Tổng quan', icon: 'dashboard' },
  { id: 'analytics', label: 'Phân tích', icon: 'analytics' },
  { id: 'responses', label: 'Phản hồi', icon: 'forum' },
  { id: 'settings', label: 'Cài đặt', icon: 'settings' },
  { id: 'help', label: 'Trợ giúp', icon: 'help' },
];

type SidebarProps = {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
};

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-20 hidden h-full w-64 flex-col border-r border-outline-variant bg-surface-container-lowest px-4 py-6 shadow-sm lg:flex">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-on-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            analytics
          </span>
        </div>
        <div>
          <h1 className="font-headline text-2xl font-bold leading-none text-on-surface">ORM AI</h1>
          <p className="text-xs text-on-surface-variant">Quản trị danh tiếng</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = item.id === activeTab;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition-all active:scale-95 ${
                active ? 'bg-surface-container-low font-bold text-primary' : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
