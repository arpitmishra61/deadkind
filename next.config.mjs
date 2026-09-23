/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Firebase Storage — download-URL form (https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<path>?...)
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**",
      },
      // Firebase Storage — direct bucket-host form (https://<bucket>.firebasestorage.app/...)
      {
        protocol: "https",
        hostname: "**.firebasestorage.app",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
