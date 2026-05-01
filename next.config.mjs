// GitHub Pages serves this site from a subpath (https://<user>.github.io/FamilyWorld/),
// so production builds need a basePath. CI sets PAGES_BASE_PATH; local dev leaves
// it unset so `next dev` keeps working at http://localhost:3000/.
const basePath = process.env.PAGES_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
};

export default nextConfig;
