import type { NextConfig } from 'next';

/** Baseline launch hardening headers for Campus 360 apps. */
export function withSecurityHeaders(config: NextConfig = {}): NextConfig {
  return {
    ...config,
    poweredByHeader: false,
    async headers() {
      const existing = typeof config.headers === 'function' ? await config.headers() : [];
      return [
        ...existing,
        {
          source: '/:path*',
          headers: [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()',
            },
            {
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: blob: https:",
                "font-src 'self' data:",
                "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
                "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
                "media-src 'self' https:",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
              ].join('; '),
            },
          ],
        },
      ];
    },
  };
}
