"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Signup failed."); return; }
      router.replace("/dashboard");
    } catch { setError("Network error. Try again."); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-ink-500">
        Free to start. Reviews are $19 each
        {process.env.NEXT_PUBLIC_DEMO_MODE !== "false" ? " (simulated in demo mode)." : "."}
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" />
        </div>
        <FieldError>{error}</FieldError>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Spinner className="h-4 w-4" />} Create account
        </Button>
        <p className="text-center text-sm text-ink-500">
          Already have an account? <Link href="/login" className="font-medium text-fairway-700 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
