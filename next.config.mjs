/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
    images: {
        domains: ['firebasestorage.googleapis.com', 'github.com', 'google.com', 'res.cloudinary.com'],
    },
    webpack: (config, { dev }) => {
        if (dev) {
            config.cache = false;
        }

        return config;
    },
};

export default nextConfig;
