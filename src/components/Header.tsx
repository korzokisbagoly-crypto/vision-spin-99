import { Link, useLocation } from "react-router-dom";
import { Settings } from "lucide-react";

export default function Header() {
  const loc = useLocation();
  const isHome = loc.pathname === "/";
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-full bg-sage flex items-center justify-center text-primary-foreground font-serif text-sm">
            ◐
          </div>
          <span className="font-serif text-xl">Loop</span>
        </Link>
        <nav className="flex items-center gap-1">
          {!isHome && (
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-full transition-smooth"
            >
              My boards
            </Link>
          )}
          <Link
            to="/settings"
            className="p-2 rounded-full hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </nav>
      </div>
    </header>
  );
}