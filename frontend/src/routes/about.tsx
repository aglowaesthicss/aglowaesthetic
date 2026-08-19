import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, MapPin, Sparkles, Stethoscope } from "lucide-react";
import { useState, useEffect } from "react";

import clinicInterior from "@/assets/clinic-interior.png.asset.json";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Button } from "@/components/ui/button";
import { ABOUT_PARAGRAPHS, HIGHLIGHTS, SITE } from "@/lib/site-data";
import { api } from "@/lib/api";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Aglow Aesthetics — Korean Aesthetic Clinic in Chennai" },
      {
        name: "description",
        content:
          "Aglow Aesthetics is Chennai's first Korean aesthetic clinic in Puzhuthivakkam, offering personalised skin, beauty and wellness treatments.",
      },
      { property: "og:title", content: "About Aglow Aesthetics" },
      {
        property: "og:description",
        content:
          "Authentic Korean expertise, holistic wellness and personalised care in Puzhuthivakkam, Chennai.",
      },
    ],
  }),
  component: About,
});

const ICONS = { sparkles: Sparkles, leaf: Leaf, stethoscope: Stethoscope, "map-pin": MapPin };

function About() {
  const [aboutData, setAboutData] = useState<{
    intro: string;
    tagline: string;
    paragraphs: string[];
    image_url: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAbout() {
      try {
        const data = await api.get<any>("/api/content/about");
        setAboutData(data);
      } catch (err) {
        console.error("Failed to load about content dynamically:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAbout();
  }, []);

  const intro = aboutData?.intro || SITE.intro;
  const tagline = aboutData?.tagline || SITE.tagline;
  const paragraphs = aboutData?.paragraphs || ABOUT_PARAGRAPHS;
  const image_url = aboutData?.image_url || clinicInterior.url;

  return (
    <div>
      <section className="glow-surface border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center">
          <p className="eyebrow">{intro}</p>
          <h1 className="mt-5 text-4xl sm:text-5xl">About Aglow Aesthetics</h1>
          <div className="rule-gold mx-auto mt-6" />
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground">{tagline}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6">
          {paragraphs.map((p, idx) => (
            <p key={idx} className="text-base leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
          <Button asChild variant="luxe" size="xl">
            <Link to="/enquiry">Begin Your Journey</Link>
          </Button>
        </div>
        <img
          src={image_url}
          alt="Aglow Aesthetics clinic reception and interior in Puzhuthivakkam, Chennai"
          loading="lazy"
          width={1408}
          height={1008}
          className="h-full w-full object-cover shadow-soft"
        />
      </section>

      <section className="border-t border-border bg-secondary/50">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <SectionHeading eyebrow="Highlights" title="What sets us apart" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {HIGHLIGHTS.map((h) => {
              const Icon = ICONS[h.icon];
              return (
                <div key={h.title} className="flex gap-5 border border-border bg-card p-7">
                  <Icon className="mt-1 size-6 shrink-0 text-primary" />
                  <div>
                    <h3 className="text-xl">{h.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{h.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
