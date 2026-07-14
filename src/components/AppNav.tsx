import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useStore } from "@/lib/store";
import { Cloud, CloudOff, RefreshCw, Check } from "lucide-react";

function SyncIndicator() {
  const status = useStore((s) => s.syncStatus);
  const map = {
    idle: { icon: Cloud, label: "Ready", cls: "text-muted-foreground" },
    syncing: { icon: RefreshCw, label: "Syncing…", cls: "text-muted-foreground animate-pulse" },
    synced: { icon: Check, label: "Synced", cls: "text-green-500" },
    offline: { icon: CloudOff, label: "Offline", cls: "text-yellow-500" },
  } as const;
  const { icon: Icon, label, cls } = map[status];
  return (
    <span className={cn("flex items-center gap-1 text-xs", cls)} title={label}>
      <Icon className={cn("h-3.5 w-3.5", status === "syncing" && "animate-spin")} />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

export function AppNav() {
  const { pathname } = useLocation();
  const today = format(new Date(), "yyyy-MM-dd");
  const links = [
    { to: "/", label: "Today" },
    { to: `/day/${today}`, label: "Day" },
    { to: "/week", label: "Week" },
    { to: "/settings", label: "Settings" },
  ];
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-semibold tracking-tight">
            SIP
          </Link>
          <SyncIndicator />
        </div>

        <nav className="flex gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-md px-3 py-1.5 hover:bg-accent",
                pathname === l.to && "bg-accent font-medium",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
