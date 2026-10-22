// QRIS statis -> QRIS dinamis (nominal otomatis). Standar EMVCo MPM.
export function crc16(s: string): string {
  let crc = 0xffff;
  for (let i = 0; i < s.length; i++) {
    crc ^= s.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

type Tlv = { tag: string; value: string };

function parse(s: string): Tlv[] {
  const out: Tlv[] = [];
  let i = 0;
  while (i < s.length) {
    const tag = s.slice(i, i + 2);
    const len = parseInt(s.slice(i + 2, i + 4), 10);
    if (!/^\d{2}$/.test(tag) || Number.isNaN(len)) throw new Error("Format QRIS tidak valid");
    const value = s.slice(i + 4, i + 4 + len);
    if (value.length !== len) throw new Error("Format QRIS tidak valid");
    out.push({ tag, value });
    i += 4 + len;
  }
  return out;
}

export function isValidQris(raw: string): boolean {
  const s = (raw || "").trim();
  if (!s.startsWith("000201") || s.length < 30 || s.slice(-8, -4) !== "6304") return false;
  try { parse(s); } catch { return false; }
  return crc16(s.slice(0, -4)) === s.slice(-4).toUpperCase();
}

export function buildDynamicQris(staticQris: string, amount: number): string {
  const s = staticQris.trim();
  if (!isValidQris(s)) throw new Error("QRIS statis belum valid. Cek di Admin > Pengaturan.");
  if (!Number.isInteger(amount) || amount < 1) throw new Error("Nominal tidak valid");
  const fields = parse(s.slice(0, -8)).filter((f) => f.tag !== "54");
  for (const f of fields) if (f.tag === "01") f.value = "12"; // 11 = statis, 12 = dinamis
  fields.push({ tag: "54", value: String(amount) });
  fields.sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0));
  const body = fields.map((f) => f.tag + String(f.value.length).padStart(2, "0") + f.value).join("") + "6304";
  return body + crc16(body);
}
