import {
  Home,
  Map,
  Cloud,
  Wind,
  Moon,
  Flag,
  Building2,
  DollarSign,
  BarChart3,
  Image as ImageIcon,
  BookOpen,
  Globe,
  X,
} from "lucide-react";
import { ThemeToggle } from "../../context/theme-context";

const nav = [
  { label: "Home", icon: Home },
  { label: "Map", icon: Map },
  { label: "Weather", icon: Cloud },
  { label: "Air Quality", icon: Wind },
  { label: "Astronomy", icon: Moon },
  { label: "Country", icon: Flag },
  { label: "Travel", icon: Building2 },
  { label: "Currency", icon: DollarSign },
  { label: "Compare", icon: BarChart3 },
  { label: "Gallery", icon: ImageIcon },
  { label: "Wikipedia", icon: BookOpen },
  { label: "Internet", icon: Globe },
];

export function Sidebar({
  mobileOpen = false,
  onClose,
  activeFocusKey = "Home",
  onSelectFocus,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
  activeFocusKey?: string;
  onSelectFocus?: (key: string) => void;
}) {
  const content = (
    <div className="flex h-full flex-col p-2.5">
      <div className="mb-2 flex items-center justify-between lg:hidden">
        <span className="px-2 text-sm font-semibold">Navigation</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="glass-chip grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 overflow-y-auto">
        {nav.map((item) => {
          const isSelected = activeFocusKey === item.label;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                onSelectFocus?.(item.label);
                onClose?.();
              }}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] font-medium transition-all cursor-pointer ${
                isSelected
                  ? "glass-strong text-primary font-semibold shadow-sm ring-1 ring-primary/40"
                  : "text-secondary-foreground hover:bg-glass hover:text-foreground"
              }`}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 pt-4">
        <ThemeToggle className="mt-1" />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="glass hidden w-[188px] shrink-0 flex-col rounded-3xl lg:flex">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[1500] flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <aside className="glass-strong relative z-10 my-2 ml-2 h-[calc(100vh-16px)] w-64 rounded-3xl shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
