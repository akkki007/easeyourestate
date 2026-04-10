"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    fetch("/api/auth/admin/login")
      .then((r) => r.json())
      .then((d) => setAdminExists(d.adminExists))
      .catch(() => setAdminExists(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      login(data.token, data.user);
      toast.success("Welcome, Admin");
      router.push("/admin");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || !setupKey) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "setup", setupKey, email, password, name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Setup failed");

      login(data.token, data.user);
      toast.success("Admin account created! Welcome.");
      router.push("/admin");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setLoading(false);
    }
  };

  if (adminExists === null) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  const isSetup = !adminExists;

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-primary-foreground">
            {isSetup ? "Admin Setup" : "Admin Panel"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSetup ? "Create your admin account" : "easeyourestate"}
          </p>
        </div>

        <form
          onSubmit={isSetup ? handleSetup : handleLogin}
          className="bg-muted border border-border rounded-2xl p-6 space-y-4"
        >
          {isSetup && (
            <>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Setup Key</label>
                <input
                  type="password"
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  placeholder="Enter ADMIN_SETUP_KEY"
                  className="w-full px-4 py-2.5 rounded-xl bg-input border border-border text-foreground text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Admin Name"
                  className="w-full px-4 py-2.5 rounded-xl bg-input border border-border text-foreground text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-input border border-border text-foreground text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10"
              autoFocus={!isSetup}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSetup ? "Min 8 characters" : "••••••"}
              className="w-full px-4 py-2.5 rounded-xl bg-input border border-border text-foreground text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !email || !password || (isSetup && (!name || !setupKey))}
            className="w-full py-2.5 rounded-xl bg-accent text-primary-foreground text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading
              ? isSetup ? "Creating..." : "Signing in..."
              : isSetup ? "Create Admin Account" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
