/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations for Vercel deployment
  poweredByHeader: false,
  
  // Skip TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip ESLint during build  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Experimental features for better performance with React Query
  experimental: {
    optimizePackageImports: ['@heroicons/react', '@headlessui/react', '@tanstack/react-query'],
    serverComponentsExternalPackages: ['argon2']
  },
  
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options', 
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  
  // Bundle analysis
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/
          }
        }
      }
    }
    
    return config
  }
};

export default nextConfig;
