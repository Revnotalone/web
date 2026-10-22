"use client";
import { useRouter } from "next/navigation";
export default function LogoutButton() {
  const router = useRouter();
  return (
    <button className="text-sm font-semibold underline" onClick={async () => { await fetch("/api/admin/login", { method: "DELETE" }); router.push("/admin/login"); router.refresh(); }}>
      Keluar
    </button>
  );
}
