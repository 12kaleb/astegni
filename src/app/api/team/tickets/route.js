import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireUser } from '../../../../lib/auth';
import { ticketUpdateSchema, validationMessage } from '../../../../lib/validation';

/**
 * GET /api/team/tickets
 * Returns all tickets + dashboard metrics for the support specialist.
 */
export async function GET() {
  try {
    const specialist = await requireUser('SUPPORT_SPECIALIST');
    if (!specialist) {
      return NextResponse.json({ error: 'Support specialist access required' }, { status: 403 });
    }

    const allTickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        specialist: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    // Compute metrics
    const open = allTickets.filter((t) => t.status === 'OPEN');
    const escalated = allTickets.filter((t) => t.status === 'ESCALATED');
    const resolved = allTickets.filter((t) => t.status === 'RESOLVED');

    const urgent = [...open, ...escalated].filter((t) => t.priority === 'URGENT');
    const high   = [...open, ...escalated].filter((t) => t.priority === 'HIGH');
    const normal = [...open, ...escalated].filter((t) => t.priority === 'NORMAL');
    const low    = [...open, ...escalated].filter((t) => t.priority === 'LOW');

    const unassigned = open.filter((t) => !t.specialistId);

    // Resolved in last 24h
    const dayAgo = new Date(Date.now() - 86400000);
    const resolvedToday = resolved.filter((t) => new Date(t.updatedAt) > dayAgo);

    // Last 7 days volume
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const volumeByDay = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const label = days[d.getDay()];
      const dateStr = d.toDateString();
      const created = allTickets.filter((t) => new Date(t.createdAt).toDateString() === dateStr).length;
      const res     = allTickets.filter((t) => t.status === 'RESOLVED' && new Date(t.updatedAt).toDateString() === dateStr).length;
      return { day: label, created, resolved: res };
    });

    // Category breakdown
    const categoryMap = {};
    allTickets.forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + 1;
    });
    const categories = Object.entries(categoryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // My assigned tickets (open + escalated)
    const myOpen = allTickets.filter(
      (t) => t.specialistId === specialist.id && t.status !== 'RESOLVED'
    );

    return NextResponse.json({
      specialist,
      tickets: allTickets,
      openTickets: open,
      escalatedTickets: escalated,
      myTickets: myOpen,
      metrics: {
        openCount: open.length + escalated.length,
        urgentCount: urgent.length,
        escalatedCount: escalated.length,
        unassignedCount: unassigned.length,
        resolvedTodayCount: resolvedToday.length,
        resolvedTotal: resolved.length,
        priorities: { urgent: urgent.length, high: high.length, normal: normal.length, low: low.length },
      },
      volumeByDay,
      categories,
    });
  } catch (err) {
    console.error('Failed to load team tickets:', err);
    return NextResponse.json({ error: 'Unable to load tickets.' }, { status: 500 });
  }
}

/**
 * PATCH /api/team/tickets
 * Update ticket status, priority, or assigned specialist.
 * Body: { id, status?, priority?, specialistId? }
 */
export async function PATCH(request) {
  try {
    const specialist = await requireUser('SUPPORT_SPECIALIST');
    if (!specialist) {
      return NextResponse.json({ error: 'Support specialist access required' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    const validation = ticketUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validationMessage(validation.error) }, { status: 400 });
    }
    const update = validation.data;

    const ticket = await prisma.ticket.findUnique({ where: { id: update.id } });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (update.specialistId) {
      const assignedSpecialist = await prisma.user.findFirst({
        where: { id: update.specialistId, role: 'SUPPORT_SPECIALIST' },
        select: { id: true },
      });
      if (!assignedSpecialist) return NextResponse.json({ error: 'Support specialist not found.' }, { status: 404 });
    }

    const { id, ...data } = update;
    if (data.specialistId === null) data.specialistId = null;

    const updated = await prisma.ticket.update({
      where: { id },
      data,
      include: {
        specialist: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ ticket: updated });
  } catch (err) {
    console.error('Failed to update ticket:', err);
    return NextResponse.json({ error: 'Unable to update ticket.' }, { status: 500 });
  }
}
