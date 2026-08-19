import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, Phone } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site-data";
import { api } from "@/lib/api";

export const Route = createFileRoute("/location")({
  head: () => ({
    meta: [
      { title: "Location — Aglow Aesthetics, Puzhuthivakkam, Chennai" },
      {
        name: "description",
        content:
          "Visit Aglow Aesthetics at Sapthagiri Nagar, Inner Ring Road, Puzhuthivakkam, Chennai - 600091. Open daily 10 AM to 8 PM. Call 9994390069.",
      },
      { property: "og:title", content: "Visit Aglow Aesthetics in Chennai" },
      {
        property: "og:description",
        content: "Our clinic in Puzhuthivakkam, Chennai — directions, hours and contact details.",
      },
    ],
  }),
  component: LocationPage,
});

function LocationPage() {
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    async function getLocations() {
      try {
        const data = await api.get<any[]>("/api/content/locations");
        setLocations(data);
      } catch (err) {
        console.error("Failed to load locations dynamically:", err);
      }
    }
    getLocations();
  }, []);

  const hasLocations = locations.length > 0;

  return (
    <div>
      <section className="glow-surface border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center">
          <p className="eyebrow">Find Us</p>
          <h1 className="mt-5 text-4xl sm:text-5xl">Our Branch</h1>
          <div className="rule-gold mx-auto mt-6" />
        </div>
      </section>

      {hasLocations ? (
        <div className="space-y-16 py-16">
          {locations.map((l) => (
            <section key={l.id} className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[1fr_1.4fr] animate-in fade-in duration-300">
              <div className="space-y-8">
                <div>
                  <h2 className="font-serif text-2xl text-primary">{l.name}</h2>
                  <p className="mt-3 flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    {l.address}
                  </p>
                </div>
                <div>
                  <p className="eyebrow">Contact</p>
                  <p className="mt-3 flex gap-3 text-sm text-muted-foreground">
                    <Phone className="size-4 shrink-0 text-primary" />
                    <a href={SITE.phoneHref} className="hover:text-primary">
                      {SITE.phone}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="eyebrow">Working Hours</p>
                  <p className="mt-3 flex gap-3 text-sm text-muted-foreground">
                    <Clock className="size-4 shrink-0 text-primary" />
                    {SITE.hours}
                  </p>
                </div>
              </div>

              <div className="border border-border shadow-soft">
                <iframe
                  title={`${l.name} location on Google Maps`}
                  src={l.google_maps_iframe_url}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[26rem] w-full lg:h-full min-h-[300px]"
                />
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="mx-auto max-w-6xl px-5 py-24 text-center">
          <p className="text-zinc-500 text-sm font-light">No clinic locations registered yet.</p>
          <p className="text-zinc-600 text-xs mt-1 font-light">Please log in to the Head Admin Dashboard to add branch locations.</p>
        </section>
      )}
    </div>
  );
}
