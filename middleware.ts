import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // You can add any middleware logic here
  // For now, we'll just pass through all requests
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}

