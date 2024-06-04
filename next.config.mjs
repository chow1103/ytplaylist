/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.ytimg.com',
        port: '',
        pathname: '**',
      },
    ],
  },
  // async headers() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       headers: [
  //         {
  //           key: 'Access-Control-Allow-Origin',
  //           value: '*',
  //         },
  //         {
  //           key: 'Access-Control-Allow-Methods',
  //           value: 'GET, POST, PUT, DELETE, OPTIONS',
  //         },
  //         {
  //           key: 'Access-Control-Allow-Headers',
  //           value: 'Content-Type, Authorization',
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
