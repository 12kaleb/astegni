function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

export async function sendLessonEmail({ recipient, subject, heading, message, lesson, idempotencyKey }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from || !recipient?.email) return false;

  const startsAt = new Date(lesson.scheduledAt).toLocaleString('en', {
    dateStyle: 'full', timeStyle: 'short', timeZone: lesson.timeZone || 'Africa/Addis_Ababa',
  });
  const safeName = escapeHtml(recipient.name || 'there');
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#182238"><h1>${escapeHtml(heading)}</h1><p>Hello ${safeName},</p><p>${escapeHtml(message)}</p><p><strong>${escapeHtml(lesson.title)}</strong><br>${escapeHtml(startsAt)} (${escapeHtml(lesson.timeZone || 'Africa/Addis_Ababa')})</p>${lesson.meetingUrl ? `<p><a href="${escapeHtml(lesson.meetingUrl)}">Open lesson room</a></p>` : ''}<p>Astegni</p></div>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify({ from, to: [recipient.email], subject, html }),
  });
  if (!response.ok) {
    console.error('Lesson notification email failed:', response.status, await response.text());
    return false;
  }
  return true;
}

export async function notifyLessonRequest(lessonId) {
  const { prisma } = await import('./prisma');
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { student: { select: { email: true, name: true } }, tutor: { select: { email: true, name: true } } },
  });
  if (!lesson) return;
  await Promise.all([
    sendLessonEmail({ recipient: lesson.tutor, subject: 'New lesson booking request', heading: 'New booking request', message: `${lesson.student.name} requested a lesson with you.`, lesson, idempotencyKey: `booking-request/tutor/${lesson.id}` }),
    sendLessonEmail({ recipient: lesson.student, subject: 'Booking request sent', heading: 'Your request was sent', message: `Your lesson request to ${lesson.tutor.name} is waiting for confirmation.`, lesson, idempotencyKey: `booking-request/student/${lesson.id}` }),
  ]);
}

export async function notifyLessonConfirmed(lessonId) {
  const { prisma } = await import('./prisma');
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { student: { select: { email: true, name: true } }, tutor: { select: { email: true, name: true } } },
  });
  if (!lesson) return;
  await Promise.all([
    sendLessonEmail({ recipient: lesson.student, subject: 'Lesson confirmed', heading: 'Your lesson is confirmed', message: `${lesson.tutor.name} confirmed your lesson.`, lesson, idempotencyKey: `lesson-confirmed/student/${lesson.id}/${lesson.scheduledAt.toISOString()}` }),
    sendLessonEmail({ recipient: lesson.tutor, subject: 'Lesson confirmed', heading: 'Lesson confirmed', message: `Your lesson with ${lesson.student.name} is confirmed.`, lesson, idempotencyKey: `lesson-confirmed/tutor/${lesson.id}/${lesson.scheduledAt.toISOString()}` }),
  ]);
}
