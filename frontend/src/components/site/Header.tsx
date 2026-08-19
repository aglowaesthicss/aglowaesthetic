import { Link } from "@tanstack/react-router";
import { Menu, Phone, X, LogIn, LayoutDashboard } from "lucide-react";
import { useState } from "react";

import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

import { SITE } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/offers", label: "Offers" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/location", label: "Location" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, hasAccess, logout } = useAuth();

  // Filter navigation links based on client permissions if logged in
  const filteredNav = NAV.filter((item) => {
    if (!isAuthenticated) return true;
    if (user?.role !== "client") return true; // Admins and staff see all public links
    
    if (item.label === "Services") return hasAccess("services");
    if (item.label === "Offers") return hasAccess("offers");
    if (item.label === "Testimonials") return hasAccess("testimonial");
    if (item.label === "Location") return hasAccess("location");
    return true;
  });

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center" onClick={() => setOpen(false)}>
          <img
            src={logo}
            alt="Aglow Aesthetics — Chennai's first ever Korean aesthetics"
            width={800}
            height={612}
            className="h-14 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {filteredNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={SITE.phoneHref}
            className="flex items-center gap-2 text-xs tracking-[0.12em] text-muted-foreground transition-colors hover:text-primary mr-2"
          >
            <Phone className="size-3.5" />
            {SITE.phone}
          </a>
          
          {isAuthenticated ? (
            <>
              <Button asChild variant="luxeOutline" size="lg">
                <Link to="/dashboard">
                  <LayoutDashboard className="size-4 mr-1.5" /> Portal
                </Link>
              </Button>
              <Button onClick={logout} variant="destructive" size="lg" className="cursor-pointer">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="luxeOutline" size="lg">
                <Link to="/login">
                  <LogIn className="size-4 mr-1.5" /> Sign In
                </Link>
              </Button>
              <Button asChild variant="luxe" size="lg">
                <Link to="/enquiry">Enquire Now</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          className="cursor-pointer p-2 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/70 bg-background lg:hidden",
          open ? "max-h-[32rem]" : "max-h-0 border-t-0",
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
          {filteredNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="py-2.5 text-sm uppercase tracking-[0.16em] text-muted-foreground"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="py-2.5 text-sm uppercase tracking-[0.16em] text-muted-foreground"
              activeProps={{ className: "text-primary" }}
            >
              Dashboard
            </Link>
          )}
          
          <div className="flex flex-col gap-2.5 mt-4 border-t border-border/40 pt-4">
            {isAuthenticated ? (
              <>
                <Button asChild variant="luxeOutline" size="lg" className="w-full">
                  <Link to="/dashboard" onClick={() => setOpen(false)}>
                    Dashboard Portal
                  </Link>
                </Button>
                <Button onClick={() => { setOpen(false); logout(); }} variant="destructive" size="lg" className="w-full cursor-pointer">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="luxeOutline" size="lg" className="w-full">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <LogIn className="size-4 mr-1.5" /> Sign In
                  </Link>
                </Button>
                <Button asChild variant="luxe" size="lg" className="w-full">
                  <Link to="/enquiry" onClick={() => setOpen(false)}>
                    Enquire Now
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
