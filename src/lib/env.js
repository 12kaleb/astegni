const requiredServerVariables = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
];

function parseUrl(name, value) {
  try {
    return new URL(value);
  } catch (error) {
    throw new Error(`Invalid ${name}: expected an absolute URL.`, { cause: error });
  }
}

export function validateServerEnv() {
  if (process.env.VERCEL !== '1' && process.env.TRUST_PROXY_HEADERS !== 'true') {
    const message = 'No trusted client IP proxy is configured. IP-based limits will share one bucket. Configure a trusted proxy to overwrite x-forwarded-for or x-real-ip and set TRUST_PROXY_HEADERS=true.';
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Non-Vercel production cannot start. ${message}`);
    }
    console.warn(`[rate-limit] ${message}`);
  }

  const missing = requiredServerVariables.filter((name) => !process.env[name]?.trim());
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
    missing.push('NEXT_PUBLIC_SITE_URL');
  }
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${[...new Set(missing)].join(', ')}.`);
  }

  for (const name of ['DATABASE_URL', 'DIRECT_URL']) {
    const value = process.env[name];
    const url = parseUrl(name, value);
    if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
      throw new Error(`Invalid ${name}: expected a PostgreSQL connection URL.`);
    }
  }

  const supabaseUrl = parseUrl('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!['https:', 'http:'].includes(supabaseUrl.protocol)) {
    throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL: expected an HTTP or HTTPS URL.');
  }
  if (process.env.NODE_ENV === 'production' && supabaseUrl.protocol !== 'https:') {
    throw new Error('Production NEXT_PUBLIC_SUPABASE_URL must use HTTPS.');
  }

  if (process.env.NODE_ENV === 'production') {
    const databaseUrl = new URL(process.env.DATABASE_URL);
    const directUrl = new URL(process.env.DIRECT_URL);
    if (databaseUrl.hostname.endsWith('.supabase.co')) {
      throw new Error('Production DATABASE_URL must use Supabase’s pooled connection hostname; set DIRECT_URL to the direct database URL for migrations.');
    }
    if (directUrl.hostname.endsWith('.pooler.supabase.com')) {
      throw new Error('Production DIRECT_URL must use Supabase’s direct database hostname for migrations.');
    }
    const siteUrl = parseUrl('NEXT_PUBLIC_SITE_URL', process.env.NEXT_PUBLIC_SITE_URL);
    if (siteUrl.protocol !== 'https:') {
      throw new Error('Production NEXT_PUBLIC_SITE_URL must use HTTPS.');
    }
  }
}
