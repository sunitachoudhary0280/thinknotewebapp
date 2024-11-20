
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
    env: {
      GROQ_API_KEY: process.env.GROQ_API_KEY,
    },
  }
  
  export default nextConfig;
  
    
  
  
