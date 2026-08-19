import { createFileRoute, Link } from "@tanstack/react-router";
import { Instagram, Quote, Youtube } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { TESTIMONIALS } from "@/lib/site-data";
import { api } from "@/lib/api";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials — Client Stories | Aglow Aesthetics Chennai" },
      {
        name: "description",
        content:
          "Read what our clients say about Korean aesthetic treatments at Aglow Aesthetics, Puzhuthivakkam, Chennai.",
      },
      { property: "og:title", content: "Client Testimonials — Aglow Aesthetics" },
      {
        property: "og:description",
        content: "Real results and real stories from our clients in Chennai.",
      },
    ],
  }),
  component: Testimonials,
});

function Testimonials() {
  const [dynamicTestimonials, setDynamicTestimonials] = useState<any[]>([]);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const data = await api.get<any[]>("/api/content/testimonials");
        setDynamicTestimonials(data);
      } catch (err) {
        console.error("Failed to load testimonials dynamically:", err);
      }
    }
    loadTestimonials();
  }, []);

  const list = dynamicTestimonials;

  return (
    <div>
      <section className="glow-surface border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center">
          <p className="eyebrow">Client Stories</p>
          <h1 className="mt-5 text-4xl sm:text-5xl">Testimonials</h1>
          <div className="rule-gold mx-auto mt-6" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        {list.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-zinc-500 text-sm font-light">No client stories posted yet.</p>
            <p className="text-zinc-600 text-xs mt-1 font-light">Please log in to the Head Admin Dashboard to add testimonials.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((t) => (
              <figure
                key={t.id || t.author}
                className="flex flex-col border border-border bg-card p-8 shadow-soft animate-in fade-in duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  {t.type === "instagram" ? (
                    <Instagram className="size-5 text-primary" />
                  ) : t.type === "youtube" ? (
                    <Youtube className="size-5 text-primary" />
                  ) : (
                    <Quote className="size-5 text-primary" />
                  )}
                </div>
                
                {t.image_url && (
                  <div className="aspect-[4/3] w-full overflow-hidden mb-5 border border-border bg-zinc-900 rounded">
                    <img src={t.image_url} alt={t.author} className="h-full w-full object-cover" />
                  </div>
                )}

                {t.quote || t.text ? (
                  <blockquote className="flex-1 font-display text-xl leading-relaxed text-zinc-200">
                    “{t.quote || t.text}”
                  </blockquote>
                ) : null}

                {t.url || t.content_url ? (
                  <a
                    href={t.url || t.content_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 text-sm text-primary underline-offset-4 hover:underline flex items-center gap-1 font-medium"
                  >
                    View post <ExternalLink className="size-3" />
                  </a>
                ) : null}
                <figcaption className="mt-7 border-t border-border pt-5 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {t.author}
                  {t.treatment ? ` · ${t.treatment}` : ""}
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Button asChild variant="luxeOutline" size="xl">
            <Link to="/enquiry">Start Your Transformation</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

// Simple local helper to prevent import crash if not already inside lucide
function ExternalLink({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}
