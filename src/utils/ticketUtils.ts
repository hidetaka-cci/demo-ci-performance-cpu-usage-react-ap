import type { Ticket, Priority, Status, TicketFormData } from '../types/ticket';

// 10000以上から開始することで、App.tsxのハードコードID (TICKET-0001〜0003) との衝突を回避
let idCounter = 10000;

export function createTicket(data: TicketFormData): Ticket {
  const now = new Date();
  return {
    id: `TICKET-${String(idCounter++).padStart(4, '0')}`,
    title: data.title.trim(),
    description: data.description.trim(),
    priority: data.priority,
    status: 'open',
    createdAt: now,
    updatedAt: now,
    assignee: data.assignee?.trim() || undefined,
    tags: data.tags.filter(tag => tag.trim().length > 0).map(tag => tag.trim()),
  };
}

export function updateTicketStatus(ticket: Ticket, status: Status): Ticket {
  return {
    ...ticket,
    status,
    updatedAt: new Date(),
  };
}

export function filterTickets(
  tickets: Ticket[],
  filters: { status?: Status; priority?: Priority; search?: string }
): Ticket[] {
  return tickets.filter(ticket => {
    if (filters.status && ticket.status !== filters.status) return false;
    if (filters.priority && ticket.priority !== filters.priority) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const inTitle = ticket.title.toLowerCase().includes(q);
      const inDesc = ticket.description.toLowerCase().includes(q);
      const inAssignee = ticket.assignee?.toLowerCase().includes(q) ?? false;
      const inTags = ticket.tags.some(t => t.toLowerCase().includes(q));
      if (!inTitle && !inDesc && !inAssignee && !inTags) return false;
    }
    return true;
  });
}

export function sortTickets(tickets: Ticket[], by: 'createdAt' | 'priority' | 'status'): Ticket[] {
  const priorityOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  const statusOrder: Record<Status, number> = { open: 0, in_progress: 1, resolved: 2, closed: 3 };

  return [...tickets].sort((a, b) => {
    if (by === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
    if (by === 'status') return statusOrder[a.status] - statusOrder[b.status];
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export function getPriorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };
  return labels[priority];
}

export function getStatusLabel(status: Status): string {
  const labels: Record<Status, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };
  return labels[status];
}

export function getTicketStats(tickets: Ticket[]) {
  return {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length,
    critical: tickets.filter(t => t.priority === 'critical').length,
  };
}
