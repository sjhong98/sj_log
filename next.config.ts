import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['hydhqrohhpgwybhlhwun.supabase.co']
  },
  serverActions: {
    bodySizeLimit: '10mb' // 또는 '5mb', '20mb' 등 원하는 크기로 설정
  }
}

export default nextConfig
