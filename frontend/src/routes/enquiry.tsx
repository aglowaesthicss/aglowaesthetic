import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SERVICE_CATEGORIES, SITE } from "@/lib/site-data";

import { api } from "@/lib/api";

export const Route = createFileRoute("/enquiry")({
  head: () => ({
    meta: [
      { title: "Enquire Now — Book a Consultation | Aglow Aesthetics" },
      {
        name: "description",
        content:
          "Send an enquiry to Aglow Aesthetics, Chennai. Share your details and preferred treatment and our team will get back to you.",
      },
      { property: "og:title", content: "Enquire at Aglow Aesthetics" },
      {
        property: "og:description",
        content: "Book a personalised Korean aesthetic consultation in Puzhuthivakkam, Chennai.",
      },
    ],
  }),
  component: Enquiry,
});

function Enquiry() {
  const [service, setService] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    
    const name = data.get("name") as string;
    const phone = data.get("phone") as string;
    const email = data.get("email") as string;
    const location = data.get("location") as string;

    if (!service) {
      toast.error("Please select a service of interest.");
      return;
    }
    
    setSubmitting(true);

    try {
      await api.post("/api/content/enquiry", {
        name,
        email,
        phone,
        location,
        service
      });
      
      form.reset();
      setService("");
      toast.success("Thank you", {
        description: "Your enquiry has been received. Our team will contact you shortly."
      });
    } catch (err: any) {
      console.error(err);
      toast.error("Submission failed", {
        description: err.message || "Failed to send enquiry. Please try again."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="glow-surface border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-20 text-center">
          <p className="eyebrow">Get In Touch</p>
          <h1 className="mt-5 text-4xl sm:text-5xl">Enquire Now</h1>
          <div className="rule-gold mx-auto mt-6" />
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Share a few details and our team will call you back to plan your personalised
            treatment. You can also reach us on{" "}
            <a href={SITE.phoneHref} className="text-primary">
              {SITE.phone}
            </a>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-5 py-16">
        <form
          onSubmit={onSubmit}
          className="space-y-6 border border-border bg-card p-8 shadow-soft sm:p-10"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                pattern="[0-9+ ]{8,15}"
                placeholder="Mobile number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" required placeholder="Area / city" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Service of interest</Label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger id="service">
                <SelectValue placeholder="Select a treatment" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {SERVICE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.title} disabled className="opacity-100">
                    <span className="text-[0.65rem] uppercase tracking-[0.16em] text-primary">
                      {cat.title}
                    </span>
                  </SelectItem>
                ))}
                {SERVICE_CATEGORIES.flatMap((cat) =>
                  cat.services.map((s) => (
                    <SelectItem key={s.name} value={s.name}>
                      {s.name}
                    </SelectItem>
                  )),
                )}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" variant="luxe" size="xl" className="w-full" disabled={submitting}>
            {submitting ? "Sending…" : "Submit Enquiry"}
          </Button>
        </form>
      </section>
    </div>
  );
}
