import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Star, Tag } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { OFFERS, type Offer } from "@/lib/site-data";
import { api } from "@/lib/api";
import { cache } from "@/lib/cache";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers — Grand Opening 20% Off | Aglow Aesthetics Chennai" },
      {
        name: "description",
        content:
          "Current offers at Aglow Aesthetics, Chennai. Get 20% instant discount on your first treatment session with promo code AGLOW20.",
      },
      { property: "og:title", content: "Offers at Aglow Aesthetics" },
      {
        property: "og:description",
        content: "Grand opening offer — 20% off your first Korean aesthetic treatment in Chennai.",
      },
    ],
  }),
  component: Offers,
});

function formatDate(value: string) {
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return value;
  }
}

function Offers() {
  const [liveOffers, setLiveOffers] = useState<any[]>(() => cache.get("/api/content/offers", []));
  const [loading, setLoading] = useState(() => liveOffers.length === 0);

  useEffect(() => {
    async function loadOffers() {
      try {
        const data = await api.get<any[]>("/api/content/offers");
        setLiveOffers(data);
        cache.set("/api/content/offers", data);
      } catch (err) {
        console.error("Failed to load offers dynamically:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOffers();
  }, []);

  const special = liveOffers.filter((o) => o.special);
  const normal = liveOffers.filter((o) => !o.special);
  const allOffers = [...special, ...normal];

  return (
    <div>
      <section className="glow-surface border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center">
          <p className="eyebrow">Limited Time</p>
          <h1 className="mt-5 text-4xl sm:text-5xl">Offers</h1>
          <div className="rule-gold mx-auto mt-6" />
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Seasonal and special offers on our Korean aesthetic treatments.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16">
        {allOffers.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            No active offers right now. Please check back soon.
          </p>
        ) : (
          <div className="space-y-8">
            {allOffers.map((o) => (
              <article
                key={o.id || o.title}
                className={
                  o.special
                    ? "border border-primary/50 bg-accent/40 p-9 shadow-soft animate-in fade-in duration-300"
                    : "border border-border bg-card p-9 shadow-soft animate-in fade-in duration-300"
                }
              >
                <div className="flex flex-wrap items-center gap-3">
                  {o.special ? (
                    <span className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-primary font-medium">
                      <Star className="size-3.5" /> Special Offer
                    </span>
                  ) : (
                    <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Offer
                    </span>
                  )}
                </div>
                <h2 className="mt-4 text-3xl font-serif text-zinc-900">{o.title}</h2>
                <p className="mt-2 text-4xl text-gold-gradient font-bold">{o.discount}</p>
                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground font-light">
                  {o.description}
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
                  {o.promo_code || o.promoCode ? (
                    <span className="flex items-center gap-2 border border-dashed border-primary/60 px-4 py-2 tracking-[0.2em] text-primary uppercase font-bold">
                      <Tag className="size-3.5" /> {o.promo_code || o.promoCode}
                    </span>
                  ) : null}
                  <span className="flex items-center gap-2">
                    <CalendarDays className="size-3.5" />
                    Valid till {formatDate(o.end_date || o.endDate)}
                  </span>
                </div>

                <Button asChild variant={o.special ? "gold" : "luxe"} size="xl" className="mt-8">
                  <Link to="/enquiry">Apply This Offer</Link>
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
