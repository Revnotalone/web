import { getSettings, publicSettings } from "@/lib/settings";
import CheckoutClient from "@/components/CheckoutClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  return <CheckoutClient s={publicSettings(await getSettings())} />;
}
