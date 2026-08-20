import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Star } from "lucide-react";
import { useState, useEffect } from "react";

import { SectionHeading } from "@/components/site/SectionHeading";
import { Button } from "@/components/ui/button";
import { SERVICE_IMAGES } from "@/lib/service-images";
import { OFFERS, SERVICE_CATEGORIES } from "@/lib/site-data";
import { api } from "@/lib/api";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Korean Skin, Laser & Anti-Aging Treatments | Aglow" },
      {
        name: "description",
        content:
          "Chemical peels, micro needling, HIFU, RF lifting, exosome therapy, IV drips, botox, fillers and laser treatments at Aglow Aesthetics, Chennai.",
      },
      { property: "og:title", content: "Treatments at Aglow Aesthetics" },
      {
        property: "og:description",
        content:
          "Explore skin rejuvenation, lifting, regenerative, injectable and laser treatments delivered with Korean precision.",
      },
    ],
  }),
  component: Services,
});

function Services() {
  const [pinned, setPinned] = useState<any[]>([]);
  const [dynamicServices, setDynamicServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const serv = await api.get<any[]>("/api/content/services");
        setDynamicServices(serv);
      } catch (err) {
        console.error("Failed to load services dynamically:", err);
      }

      try {
        const off = await api.get<any[]>("/api/content/offers");
        setPinned(off.filter((o) => o.special));
      } catch (err) {
        console.error("Failed to load offers dynamically, using fallback data:", err);
        setPinned(OFFERS.filter((o) => o.special));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const displayServices = dynamicServices.length > 0;

  // Group dynamic services by category
  const servicesByCategory: { [key: string]: any[] } = {};
  dynamicServices.forEach((s) => {
    const cat = s.category || "Skin Rejuvenation and Resurfacing";
    if (!servicesByCategory[cat]) {
      servicesByCategory[cat] = [];
    }
    servicesByCategory[cat].push(s);
  });

  const categoriesList = [
    "Skin Rejuvenation and Resurfacing",
    "Energy Based Skin Tightening and Lifting",
    "Hair and Regenerative Therapies",
    "IV Nutrient Infusions",
    "Injectables and Anti Aging",
    "Lasers"
  ];

  return (
    <div>
      <section className="glow-surface border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center">
          <p className="eyebrow">Our Treatments</p>
          <h1 className="mt-5 text-4xl sm:text-5xl">Services</h1>
          <div className="rule-gold mx-auto mt-6" />
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground">
            Every treatment is planned around your skin type, concerns and goals. Pricing is
            shared during your personalised consultation.
          </p>
        </div>
      </section>

      {pinned.length ? (
        <section className="mx-auto max-w-6xl px-5 pt-14">
          {pinned.map((o) => (
            <div
              key={o.id || o.title}
              className="flex flex-wrap items-center justify-between gap-4 border border-primary/40 bg-accent/50 p-7 animate-in fade-in duration-300"
            >
              <div className="flex items-start gap-4">
                <Star className="mt-1 size-5 shrink-0 text-primary" />
                <div>
                  <p className="eyebrow">Special Offer</p>
                  <h2 className="mt-2 text-2xl">
                    {o.title} — {o.discount}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">{o.description}</p>
                </div>
              </div>
              <Button asChild variant="gold" size="lg">
                <Link to="/offers">Claim Offer</Link>
              </Button>
            </div>
          ))}
        </section>
      ) : null}

      {/* Dynamic Services List or static categories fallback */}
      {displayServices ? (
        <section className="mx-auto max-w-6xl space-y-20 px-5 py-16">
          {categoriesList
            .filter((catName) => servicesByCategory[catName] && servicesByCategory[catName].length > 0)
            .map((catName, i) => (
              <div key={catName} className="grid gap-8 lg:grid-cols-[1fr_1.3fr] animate-in fade-in duration-300">
                <div>
                  <p className="eyebrow">{String(i + 1).padStart(2, "0")}</p>
                  <h2 className="mt-3 text-3xl leading-tight font-serif text-zinc-900">{catName}</h2>
                  <div className="rule-gold mt-5" />
                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground font-light">
                    Premium clinical services under {catName.toLowerCase()} delivered with Korean precision and standard care.
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  {servicesByCategory[catName].map((s) => (
                    <article key={s.id} className="group border border-border bg-card shadow-soft">
                      <div className="aspect-[4/3] overflow-hidden bg-zinc-900 flex items-center justify-center relative">
                        {s.image_url || SERVICE_IMAGES[s.name] ? (
                          <img
                            src={s.image_url || SERVICE_IMAGES[s.name]}
                            alt={s.name}
                            loading="lazy"
                            width={1000}
                            height={750}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">Skin Care</span>
                        )}
                      </div>
                      <div className="p-6 space-y-3">
                        <h3 className="font-serif text-lg text-zinc-900">{s.name}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed font-light line-clamp-3">{s.description}</p>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-[0.7rem] uppercase tracking-wider text-primary font-medium">Korean Standard</span>
                          {s.price ? (
                            <span className="text-sm font-bold text-zinc-800">₹{s.price}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Pricing on consultation</span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
        </section>
      ) : (
        <section className="mx-auto max-w-6xl px-5 py-24 text-center">
          <p className="text-zinc-500 text-sm font-light">No clinical treatments registered yet.</p>
          <p className="text-zinc-600 text-xs mt-1 font-light">Please log in to the Head Admin Dashboard to populate your services.</p>
        </section>
      )}

      <section className="border-t border-border bg-secondary/50">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <SectionHeading
            eyebrow="Next Step"
            title="Not sure which treatment is right for you?"
            description="Share your concerns and our team will recommend a personalised plan."
          />
          <Button asChild variant="luxe" size="xl" className="mt-8">
            <Link to="/enquiry">Enquire Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
