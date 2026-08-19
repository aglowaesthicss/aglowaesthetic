import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Phone } from "lucide-react";

import logo from "@/assets/logo.png";
import { SITE } from "@/lib/site-data";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-3">
        <div>
          <img
            src={logo}
            alt="Aglow Aesthetics"
            loading="lazy"
            width={800}
            height={612}
            className="h-24 w-auto"
          />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-foreground/70">
            {SITE.motto}
          </p>
        </div>


        <div className="space-y-4 text-sm text-ink-foreground/75">
          <p className="eyebrow text-gold">Visit Us</p>
          <p className="flex gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
            <span className="leading-relaxed">{SITE.address}</span>
          </p>
          <p className="flex gap-3">
            <Phone className="size-4 shrink-0 text-gold" />
            <a href={SITE.phoneHref} className="hover:text-gold">
              {SITE.phone}
            </a>
          </p>
          <p className="flex gap-3">
            <Clock className="size-4 shrink-0 text-gold" />
            <span>{SITE.hours}</span>
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="eyebrow text-gold">Explore</p>
          {[
            { to: "/about", label: "About Us" },
            { to: "/services", label: "Services" },
            { to: "/offers", label: "Offers" },
            { to: "/testimonials", label: "Testimonials" },
            { to: "/location", label: "Location" },
            { to: "/enquiry", label: "Enquiry" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="block text-ink-foreground/70 transition-colors hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-ink-foreground/10">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs tracking-[0.12em] text-ink-foreground/50">
          © {new Date().getFullYear()} {SITE.name} · Puzhuthivakkam, Chennai
        </p>
      </div>
    </footer>
  );
}
