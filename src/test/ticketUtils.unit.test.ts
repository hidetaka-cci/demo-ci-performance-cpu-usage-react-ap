import { describe, it, expect } from 'vitest';
import {
  getPriorityLabel,
  getStatusLabel,
  createTicket,
  filterTickets,
  sortTickets,
} from '../utils/ticketUtils';
import type { Ticket, Priority, Status } from '../types/ticket';

describe('getPriorityLabel', () => {
  it('returns "Low" for low priority', () => {
    expect(getPriorityLabel('low')).toBe('Low');
  });

  it('returns "Medium" for medium priority', () => {
    expect(getPriorityLabel('medium')).toBe('Medium');
  });

  it('returns "High" for high priority', () => {
    expect(getPriorityLabel('high')).toBe('High');
  });

  it('returns "Critical" for critical priority', () => {
    expect(getPriorityLabel('critical')).toBe('Critical');
  });

  it('covers all Priority values', () => {
    const priorities: Priority[] = ['low', 'medium', 'high', 'critical'];
    const labels = priorities.map(getPriorityLabel);
    expect(labels).toEqual(['Low', 'Medium', 'High', 'Critical']);
  });
});

describe('getStatusLabel', () => {
  it('returns "Open" for open status', () => {
    expect(getStatusLabel('open')).toBe('Open');
  });

  it('returns "In Progress" for in_progress status', () => {
    expect(getStatusLabel('in_progress')).toBe('In Progress');
  });

  it('returns "Resolved" for resolved status', () => {
    expect(getStatusLabel('resolved')).toBe('Resolved');
  });

  it('returns "Closed" for closed status', () => {
    expect(getStatusLabel('closed')).toBe('Closed');
  });

  it('covers all Status values', () => {
    const statuses: Status[] = ['open', 'in_progress', 'resolved', 'closed'];
    const labels = statuses.map(getStatusLabel);
    expect(labels).toEqual(['Open', 'In Progress', 'Resolved', 'Closed']);
  });
});

describe('createTicket - edge cases', () => {
  it('trims whitespace-only assignee to undefined', () => {
    const ticket = createTicket({
      title: 'Test',
      description: 'Desc',
      priority: 'low',
      assignee: '   ',
      tags: [],
    });
    expect(ticket.assignee).toBeUndefined();
  });

  it('filters out blank tags from comma-separated entries', () => {
    const ticket = createTicket({
      title: 'Test',
      description: 'Desc',
      priority: 'low',
      tags: ['  ', 'bug', '', 'frontend'],
    });
    expect(ticket.tags).toEqual(['bug', 'frontend']);
  });

  it('trims whitespace from tags', () => {
    const ticket = createTicket({
      title: 'Test',
      description: 'Desc',
      priority: 'medium',
      tags: ['  bug  ', ' ui '],
    });
    expect(ticket.tags).toEqual(['bug', 'ui']);
  });

  it('generates unique IDs on sequential calls', () => {
    const t1 = createTicket({ title: 'A', description: 'B', priority: 'low', tags: [] });
    const t2 = createTicket({ title: 'A', description: 'B', priority: 'low', tags: [] });
    expect(t1.id).not.toBe(t2.id);
  });
});

describe('filterTickets - combined filters', () => {
  const makeTicket = (overrides: Partial<Ticket>): Ticket => ({
    id: 'T-0001',
    title: 'Default',
    description: 'Default desc',
    priority: 'low',
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
    ...overrides,
  });

  it('returns empty array when no tickets match status filter', () => {
    const tickets = [makeTicket({ status: 'open' }), makeTicket({ status: 'open' })];
    expect(filterTickets(tickets, { status: 'closed' })).toHaveLength(0);
  });

  it('returns empty array when no tickets match priority filter', () => {
    const tickets = [makeTicket({ priority: 'low' }), makeTicket({ priority: 'medium' })];
    expect(filterTickets(tickets, { priority: 'critical' })).toHaveLength(0);
  });

  it('matches search in assignee field', () => {
    const tickets = [
      makeTicket({ assignee: 'Alice', title: 'ticket' }),
      makeTicket({ title: 'other' }),
    ];
    const result = filterTickets(tickets, { search: 'alice' });
    expect(result).toHaveLength(1);
    expect(result[0].assignee).toBe('Alice');
  });

  it('matches search in tags', () => {
    const tickets = [
      makeTicket({ tags: ['urgent', 'backend'] }),
      makeTicket({ tags: ['frontend'] }),
    ];
    const result = filterTickets(tickets, { search: 'urgent' });
    expect(result).toHaveLength(1);
  });

  it('combines status and priority filters', () => {
    const tickets = [
      makeTicket({ status: 'open', priority: 'high' }),
      makeTicket({ status: 'open', priority: 'low' }),
      makeTicket({ status: 'closed', priority: 'high' }),
    ];
    const result = filterTickets(tickets, { status: 'open', priority: 'high' });
    expect(result).toHaveLength(1);
  });

  it('returns empty array for empty ticket list', () => {
    expect(filterTickets([], { status: 'open' })).toHaveLength(0);
  });
});

describe('sortTickets - ordering guarantees', () => {
  const makeTicket = (overrides: Partial<Ticket>): Ticket => ({
    id: 'T-0001',
    title: 'Default',
    description: 'Desc',
    priority: 'low',
    status: 'open',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    tags: [],
    ...overrides,
  });

  it('sorts by status: open before in_progress before resolved before closed', () => {
    const tickets = [
      makeTicket({ id: 'd', status: 'closed' }),
      makeTicket({ id: 'b', status: 'in_progress' }),
      makeTicket({ id: 'c', status: 'resolved' }),
      makeTicket({ id: 'a', status: 'open' }),
    ];
    const result = sortTickets(tickets, 'status');
    expect(result.map(t => t.status)).toEqual(['open', 'in_progress', 'resolved', 'closed']);
  });

  it('sorts by createdAt: newest first', () => {
    const tickets = [
      makeTicket({ id: 'old', createdAt: new Date('2024-01-01') }),
      makeTicket({ id: 'new', createdAt: new Date('2024-06-01') }),
      makeTicket({ id: 'mid', createdAt: new Date('2024-03-01') }),
    ];
    const result = sortTickets(tickets, 'createdAt');
    expect(result[0].id).toBe('new');
    expect(result[2].id).toBe('old');
  });

  it('handles empty list without error', () => {
    expect(sortTickets([], 'priority')).toEqual([]);
  });
});
