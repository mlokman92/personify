import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile in a parent directory otherwise
  // makes Turbopack guess the wrong project root.
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
