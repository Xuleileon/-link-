/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable all SWC features
  swcMinify: false,
  
  // Configure transpilation
  transpilePackages: [],
  
  // Disable experimental features
  experimental: {
    swcMinify: false,
    swcTraceProfiling: false,
    forceSwcTransforms: false,
    swcPlugins: false,
    serverComponents: false,
    swcFileReading: false
  },
  
  // Configure webpack to use Babel
  webpack: (config, { dev, isServer }) => {
    // Force Babel for all JS/TS files
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel']
        }
      }
    });

    return config;
  }
}

module.exports = nextConfig