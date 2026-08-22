import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Client & Staff Login | Aglow Aesthetics" },
      {
        name: "description",
        content:
          "Sign in to your Aglow Aesthetics account to view your service history, upcoming sessions, invoices and exclusive offers.",
      },
      { property: "og:title", content: "Login — Aglow Aesthetics" },
      {
        property: "og:description",
        content: "Secure access for clients, front office and administrators of Aglow Aesthetics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function Login() {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const data = await api.post<{ access_token: string; user: any }>("/api/auth/login", {
        email,
        password
      });

      login(data.access_token, data.user);
      toast.success("Successfully logged in", {
        description: `Welcome back, ${data.user.name}!`,
      });
      
      // Delay navigation slightly to let state update
      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 100);
    } catch (err: any) {
      console.error(err);
      toast.error("Login failed", {
        description: err.message || "Invalid email or password",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center px-5 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-8 shadow-sm sm:p-10">
        <div className="flex flex-col items-center text-center">
          <img
            src={logo}
            alt="Aglow Aesthetics"
            width={800}
            height={612}
            className="h-16 w-auto"
          />
          <h1 className="mt-6 font-serif text-3xl">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to view your sessions, service history and offers.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="luxe" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs tracking-[0.08em] text-muted-foreground">
          New to Aglow?{" "}
          <Link to="/enquiry" className="text-primary underline-offset-4 hover:underline">
            Send an enquiry
          </Link>{" "}
          and our team will set up your account.
        </p>
      </div>
    </main>
  );
}
