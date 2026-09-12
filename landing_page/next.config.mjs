/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Uploaded media from the admin panel's S3 bucket. Required for
        // next/image; plain <img> works without it, but CMS images should not
        // depend on which tag a component happens to use.
        protocol: 'https',
        hostname: 'anwar-clinic-assets.s3.ap-south-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'www.qhtclinic.com',
      },
      {
        protocol: 'https',
        hostname: 'qhtclinic.com',
      },
    ],
  },
};

export default nextConfig;
