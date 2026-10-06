import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.GITHUB_ACTIONS ? "/custom-readme" : "",
  assetPrefix: process.env.GITHUB_ACTIONS ? "/custom-readme/" : "",
};

export default nextConfig;
