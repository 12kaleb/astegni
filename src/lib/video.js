import { randomUUID } from 'node:crypto';

export function createMeetingUrl() {
  const host = (process.env.JITSI_DOMAIN || 'meet.jit.si').replace(/^https?:\/\//, '').replace(/\/$/, '');
  return `https://${host}/astegni-${randomUUID()}`;
}
