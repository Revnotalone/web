/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }, // aman dilepas bila kamu sudah menjalankan `npx tsc --noEmit` dengan bersih
};
export default nextConfig;
