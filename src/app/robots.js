export default function robots() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
