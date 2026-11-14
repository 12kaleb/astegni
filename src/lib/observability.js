import * as Sentry from '@sentry/nextjs';

export function reportException(context, error) {
  console.error(`[${context}]`, error);
  Sentry.captureException(error, { tags: { context } });
}
