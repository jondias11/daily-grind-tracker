import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
        <Link to="/" className="font-semibold tracking-tight">
          NeetCode Tracker
        </Link>
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
