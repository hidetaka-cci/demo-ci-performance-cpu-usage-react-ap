import { describe, it, expect } from 'vitest';
import {
  getPriorityLabel,
  getStatusLabel,
  sortTickets,
  filterTickets,
} from '../utils/ticketUtils';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Test ticket',
  description: 'Test description',
  priority: 'low',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
};

// ── getPriorityLabel ──────────────────────────────────────────────────────────

describe('getPriorityLabel', () => {
  it('returns the display label for every priority value', () => {
    expect(getPriorityLabel('low')).toBe('Low');
    expect(getPriorityLabel('medium')).toBe('Medium');
    expect(getPriorityLabel('high')).toBe('High');
    expect(getPriorityLabel('critical')).toBe('Critical');
  });
});

// ── getStatusLabel ────────────────────────────────────────────────────────────

describe('getStatusLabel', () => {
  it('returns the display label for every status value', () => {
    expect(getStatusLabel('open')).toBe('Open');
    expect(getStatusLabel('in_progress')).toBe('In Progress');
    expect(getStatusLabel('resolved')).toBe('Resolved');
    expect(getStatusLabel('closed')).toBe('Closed');
  });
});

// ── sortTickets - status ordering ─────────────────────────────────────────────

describe('sortTickets - status', () => {
  const tickets: Ticket[] = [
    { ...baseTicket, id: 'T1', status: 'closed' },
    { ...baseTicket, id: 'T2', status: 'resolved' },
    { ...baseTicket, id: 'T3', status: 'in_progress' },
    { ...baseTicket, id: 'T4', status: 'open' },
  ];

  it('orders open → in_progress → resolved → closed', () => {
    const sorted = sortTickets(tickets, 'status');
    expect(sorted.map(t => t.status)).toEqual([
      'open',
      'in_progress',
      'resolved',
      'closed',
    ]);
  });

  it('does not mutate the original array', () => {
    const ids = tickets.map(t => t.id);
    sortTickets(tickets, 'status');
    expect(tickets.map(t => t.id)).toEqual(ids);
  });

  it('sorts by createdAt descending (newest first)', () => {
    const dated: Ticket[] = [
      { ...baseTicket, id: 'old', createdAt: new Date('2024-01-01') },
      { ...baseTicket, id: 'new', createdAt: new Date('2024-06-01') },
    ];
    const sorted = sortTickets(dated, 'createdAt');
    expect(sorted[0].id).toBe('new');
    expect(sorted[1].id).toBe('old');
  });
});

// ── filterTickets - combined filters and edge cases ───────────────────────────

describe('filterTickets - combined and edge cases', () => {
  const tickets: Ticket[] = [
    { ...baseTicket, id: 'T1', status: 'open', priority: 'critical', assignee: 'Alice', tags: ['frontend'] },
    { ...baseTicket, id: 'T2', status: 'open', priority: 'low', assignee: 'Bob', tags: ['backend'] },
    { ...baseTicket, id: 'T3', status: 'closed', priority: 'critical', tags: [] },
  ];

  it('applies status and priority filters together (AND logic)', () => {
    const result = filterTickets(tickets, { status: 'open', priority: 'critical' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('T1');
  });

  it('returns empty array when no ticket matches combined filter', () => {
    const result = filterTickets(tickets, { status: 'resolved', priority: 'critical' });
    expect(result).toHaveLength(0);
  });

  it('matches search query against assignee (case-insensitive)', () => {
    const result = filterTickets(tickets, { search: 'alice' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('T1');
  });

  it('matches search query against tags (case-insensitive)', () => {
    const result = filterTickets(tickets, { search: 'FRONTEND' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('T1');
  });

  it('excludes tickets whose assignee is undefined when searching', () => {
    const result = filterTickets(tickets, { search: 'frontend' });
    expect(result.every(t => t.tags.some(tag => tag.includes('frontend')))).toBe(true);
  });

  it('returns all tickets when no filter is provided', () => {
    const result = filterTickets(tickets, {});
    expect(result).toHaveLength(tickets.length);
  });
});
