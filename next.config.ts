import type { NextConfig } from "next";
import * as fs from "fs";
import * as path from "path";


const securityJsonPath = path.join(process.cwd(), 'security-headers.json');
let securityHeaders: { key: string; value: string }[] = [];

try {
  if (fs.existsSync(securityJsonPath)) {
    const data = fs.readFileSync(securityJsonPath, 'utf-8');
    securityHeaders = JSON.parse(data);
  }
} catch (e) {
  console.log("⚠️ Security headers lipsă.");
}


const nextConfig: NextConfig = {
    async headers() {
      if (!securityHeaders || securityHeaders.length === 0) {
      return []; 
    }
    return [
      {
        source: '/:path*', 
        headers: securityHeaders,
      },
    ];
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, 
  },
};

export default nextConfig;