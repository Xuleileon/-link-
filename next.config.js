/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC completely
  swcMinify: false,
  experimental: {
    forceSwcTransforms: false,
    swcMinify: false,
    swcLoader: false,
    swcTraceProfiling: false
  },
  
  // Configure webpack to use Babel
  webpack: (config, { dev, isServer }) => {
    // Disable SWC loader
    config.module.rules = config.module.rules.map((rule) => {
      if (rule.oneOf) {
        rule.oneOf = rule.oneOf.map((oneOfRule) => {
          if (oneOfRule.use && oneOfRule.use.loader === 'next-swc-loader') {
            return {
              ...oneOfRule,
              use: {
                loader: 'babel-loader',
                options: {
                  cacheDirectory: true,
                  presets: ['next/babel']
                }
              }
            };
          }
          return oneOfRule;
        });
      }
      return rule;
    });

    return config;
  }
}

module.exports = nextConfig