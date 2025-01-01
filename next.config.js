/** @type {import('next').NextConfig} */
const TerserPlugin = require('terser-webpack-plugin');

const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  output: 'export',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          minSize: 10000,
          maxSize: 20000000,
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: 'lib',
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            }
          },
        },
      };

      config.optimization.minimizer = [
        ...config.optimization.minimizer,
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
            mangle: true,
          },
        }),
      ];
    }

    config.module.rules.push({
      test: /\.(mp3)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name][ext]'
      }
    });

    return config;
  },
}

module.exports = nextConfig 