/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true, // 启用 styled-components
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp3)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name][ext]'
      }
    });
    return config;
  }
}

module.exports = nextConfig 