/** @type {import('next').NextConfig} */
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_EXTRA_CA_CERTS =
    process.env.NODE_EXTRA_CA_CERTS ||
    `${process.env.LOCALAPPDATA}\\mkcert\\rootCA.pem`;
}

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  output: "standalone",

  images: { formats: ["image/avif", "image/webp"] },

  modularizeImports: {
    "@mui/material": { transform: "@mui/material/{{member}}" },
    "@mui/icons-material": { transform: "@mui/icons-material/{{member}}" },
    "@mui/lab": { transform: "@mui/lab/{{member}}" },
  },

  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
