import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
  return (<><h1 className="mb-4 text-2xl font-extrabold">Pengaturan</h1><SettingsForm initial={await getSettings()} /></>);
}
