/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so the prototype can be served from any static host
  // (including GitHub Pages) without a Node runtime.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
