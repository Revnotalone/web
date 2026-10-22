"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    setBusy(false);
    if (r.ok) { router.push("/admin"); router.refresh(); } else setErr((await r.json().catch(() => ({}))).error || "Gagal masuk");
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-sun p-4">
      <form onSubmit={submit} className="panel w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-extrabold">Masuk admin</h1>
        <div><label className="label" htmlFor="pw">Password</label>
          <input id="pw" type="password" className="input" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus /></div>
        {err && <p role="alert" className="font-semibold text-bad">{err}</p>}
        <button className="btn btn-primary w-full" disabled={busy || !pw}>{busy ? "Memeriksa…" : "Masuk"}</button>
      </form>
    </div>
  );
}
