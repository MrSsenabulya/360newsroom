import type { NextConfig } from 'next';
import { withSecurityHeaders } from '@campus360/config/security-headers';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@campus360/ui',
    '@campus360/auth',
    '@campus360/domain',
    '@campus360/db',
    '@campus360/content',
    '@campus360/search',
    '@campus360/config',
  ],
};

export default withSecurityHeaders(nextConfig);
