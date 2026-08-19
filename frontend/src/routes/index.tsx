import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, MapPin, Sparkles, Stethoscope } from "lucide-react";

import clinicInterior from "@/assets/clinic-interior.png.asset.json";
import heroImg from "@/assets/hero.jpg";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CATEGORY_COVERS } from "@/lib/service-images";
import { Button } from "@/components/ui/button";

import { HIGHLIGHTS, OFFERS, SERVICE_CATEGORIES, SITE } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aglow Aesthetics — Chennai's First Korean Aesthetic Clinic" },
      {
        name: "description",
        content:
          "Authentic Korean skin, beauty and wellness treatments in Puzhuthivakkam, Chennai. Advanced facials, HIFU, lasers, injectables and regenerative therapies.",
      },
      { property: "og:title", content: "Aglow Aesthetics — Korean Aesthetics in Chennai" },
      {
        property: "og:description",
        content:
          "The pinnacle of Korean skincare prestige. Personalised skin, beauty and wellness treatments in Chennai.",
      },
    ],
  }),
  component: Home,
});

const ICONS = { sparkles: Sparkles, leaf: Leaf, stethoscope: Stethoscope, "map-pin": MapPin };

function Home() {
  const specialOffer = OFFERS.find((o) => o.special);

  return (
    <div>
      <section className="glow-surface relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="eyebrow">{SITE.intro}</p>
            <h1 className="mt-6 text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              The Pinnacle of
              <span className="block text-gold-gradient">Korean Skincare</span>
              Prestige
            </h1>
            <div className="rule-gold mt-7" />
            <p className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground">
              {SITE.tagline}. Advanced South Korean technology, individualised protocols
              and holistic wellness — in the heart of Puzhuthivakkam, Chennai.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="luxe" size="xl">
                <Link to="/enquiry">Book a Consultation</Link>
              </Button>
              <Button asChild variant="luxeOutline" size="xl">
                <Link to="/services">Explore Treatments</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImg}
              alt="Radiant glass skin result from Korean aesthetic treatment"
              width={1600}
              height={1200}
              className="w-full object-cover shadow-lift"
            />
          </div>
        </div>
      </section>

      {specialOffer ? (
        <section className="border-y border-border bg-ink text-ink-foreground">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6">
            <p className="text-sm tracking-[0.14em] uppercase">
              <span className="text-gold">{specialOffer.discount}</span> ·{" "}
              {specialOffer.title} — promo code {specialOffer.promoCode}
            </p>
            <Button asChild variant="gold" size="lg">
              <Link to="/offers">View Offer</Link>
            </Button>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-5 py-20">
        <SectionHeading
          eyebrow="Why Aglow"
          title="Korean aesthetic standards, personalised for you"
          description="A holistic approach to skin, beauty and wellness — delivered with clinical precision and genuine warmth."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((h) => {
            const Icon = ICONS[h.icon];
            return (
              <div
                key={h.title}
                className="border border-border bg-card p-7 shadow-soft transition-shadow hover:shadow-lift"
              >
                <Icon className="size-6 text-primary" />
                <h3 className="mt-5 text-xl">{h.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{h.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2">
          <img
            src={clinicInterior.url}
            alt="Aglow Aesthetics clinic reception and interior in Puzhuthivakkam, Chennai"
            loading="lazy"
            width={1408}
            height={1008}
            className="w-full object-cover shadow-soft"
          />
          <div>
            <SectionHeading
              eyebrow="About Us"
              align="left"
              title="Chennai's first ever Korean aesthetic clinic"
              description="We bring you the secrets of flawless, glass-skin beauty straight from South Korea — combining advanced technology, innovative techniques and treatments designed around you."
            />
            <Button asChild variant="luxeOutline" size="xl" className="mt-8">
              <Link to="/about">Our Story</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <SectionHeading
          eyebrow="Treatments"
          title="Signature categories of care"
          description="From resurfacing and lifting to regenerative and wellness therapies."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_CATEGORIES.map((cat) => (
            <article key={cat.slug} className="group border border-border bg-card shadow-soft">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={CATEGORY_COVERS[cat.slug]}
                  alt={cat.title}
                  loading="lazy"
                  width={1000}
                  height={750}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-8">
                <p className="eyebrow">
                  {String(cat.services.length).padStart(2, "0")} Treatments
                </p>
                <h3 className="mt-4 text-2xl leading-snug">{cat.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{cat.blurb}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="luxe" size="xl">
            <Link to="/services">View All Services</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
