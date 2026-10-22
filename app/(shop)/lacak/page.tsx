"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Lacak() {
  const [code, setCode] = useState("");
  const router = useRouter();
  return (
    <form className="panel mx-auto max-w-md" onSubmit={(e) => { e.preventDefault(); if (code.trim()) router.push(`/pesanan/${code.trim().toUpperCase()}`); }}>
      <h1 className="text-2xl font-extrabold">Lacak pesanan</h1>
      <p className="mb-4 text-ink/70">Masukkan kode pesanan yang kamu terima setelah checkout.</p>
      <label className="label" htmlFor="kode">Kode pesanan</label>
      <input id="kode" className="input" placeholder="AIPI-XXXXXX" value={code} onChange={(e) => setCode(e.target.value)} />
      <button className="btn btn-primary mt-4 w-full">Cek status</button>
    </form>
  );
}
