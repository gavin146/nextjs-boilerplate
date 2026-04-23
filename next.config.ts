import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  turbopack: {
    // `next.config.ts` is evaluated as an ES module; `__dirname` is not reliable.
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
};

export default nextConfig;
