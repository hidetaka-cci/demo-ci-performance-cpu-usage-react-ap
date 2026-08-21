/**
 * Unit tests for ticketUtils
 *
 * The existing ticketUtils.pbt.test.ts covers properties across randomised
 * inputs but leaves gaps around:
 *   - getPriorityLabel / getStatusLabel — the label mappings are not asserted
 *     directly. When called via component tests they render, but the exact
 *     mapping (e.g. 'in_progress' -> 'In Progress') is never verified.
 *   - sortTickets — only 'priority' is checked as a property; 'createdAt' and
 *     'status' ordering are not exercised.
 *   - filterTickets — each filter is checked in isolation; combined filter
 *     semantics (AND across status + priority + search) are not verified.
 *   - createTicket — the ID uniqueness across consecutive calls and the
 *     4-digit zero-padded ID format are not directly asserted.
 */

import { describe, it, expect } from 'vitest';
import {
  createTicket,
  filterTickets,
  getPriorityLabel,
  getStatusLabel,
  getTicketStats,
  sortTickets,
} from '../utils/ticketUtils';
import type { Ticket } from '../types/ticket';

const makeTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: 'TICKET-9999',
  title: 'sample',
  description: 'sample description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  tags: [],
  ...overrides,
});

describe('getPriorityLabel', () => {
  it('maps low -> "Low"', () => {
    expect(getPriorityLabel('low')).toBe('Low');
  });

  it('maps medium -> "Medium"', () => {
    expect(getPriorityLabel('medium')).toBe('Medium');
  });

  it('maps high -> "High"', () => {
    expect(getPriorityLabel('high')).toBe('High');
  });

  it('maps critical -> "Critical"', () => {
    expect(getPriorityLabel('critical')).toBe('Critical');
  });
});

describe('getStatusLabel', () => {
  it('maps open -> "Open"', () => {
    expect(getStatusLabel('open')).toBe('Open');
  });

  it('maps in_progress -> "In Progress" (with space, not snake_case)', () => {
    expect(getStatusLabel('in_progress')).toBe('In Progress');
  });

  it('maps resolved -> "Resolved"', () => {
    expect(getStatusLabel('resolved')).toBe('Resolved');
  });

  it('maps closed -> "Closed"', () => {
    expect(getStatusLabel('closed')).toBe('Closed');
  });
});

describe('sortTickets - createdAt mode', () => {
  it('orders newest first', () => {
    const older = makeTicket({ id: 'TICKET-1', createdAt: new Date('2024-01-01') });
    const middle = makeTicket({ id: 'TICKET-2', createdAt: new Date('2024-06-01') });
    const newest = makeTicket({ id: 'TICKET-3', createdAt: new Date('2024-12-01') });

    const result = sortTickets([older, newest, middle], 'createdAt');

    expect(result.map(t => t.id)).toEqual(['TICKET-3', 'TICKET-2', 'TICKET-1']);
  });

  it('is stable-ish: same-date items keep relative order (via Array.prototype.sort)', () => {
    const a = makeTicket({ id: 'A', createdAt: new Date('2024-01-01') });
    const b = makeTicket({ id: 'B', createdAt: new Date('2024-01-01') });

    const result = sortTickets([a, b], 'createdAt');

    // Both have equal timestamps, so cmp returns 0 and order is preserved.
    expect(result.map(t => t.id)).toEqual(['A', 'B']);
  });
});

describe('sortTickets - status mode', () => {
  it('orders open < in_progress < resolved < closed', () => {
    const closed = makeTicket({ id: 'c', status: 'closed' });
    const open = makeTicket({ id: 'o', status: 'open' });
    const resolved = makeTicket({ id: 'r', status: 'resolved' });
    const inProgress = makeTicket({ id: 'i', status: 'in_progress' });

    const result = sortTickets([closed, resolved, inProgress, open], 'status');

    expect(result.map(t => t.status)).toEqual(['open', 'in_progress', 'resolved', 'closed']);
  });
});

describe('sortTickets - empty input', () => {
  it('returns an empty array for an empty input', () => {
    expect(sortTickets([], 'createdAt')).toEqual([]);
    expect(sortTickets([], 'priority')).toEqual([]);
    expect(sortTickets([], 'status')).toEqual([]);
  });
});

describe('filterTickets - combined filters', () => {
  const tickets: Ticket[] = [
    makeTicket({ id: '1', status: 'open', priority: 'high', title: 'login bug', assignee: 'alice' }),
    makeTicket({ id: '2', status: 'open', priority: 'low', title: 'typo fix', assignee: 'bob' }),
    makeTicket({ id: '3', status: 'resolved', priority: 'high', title: 'login patch', tags: ['auth'] }),
    makeTicket({ id: '4', status: 'in_progress', priority: 'high', description: 'auth-related', assignee: 'carol' }),
  ];

  it('AND-combines status + priority', () => {
    const result = filterTickets(tickets, { status: 'open', priority: 'high' });
    expect(result.map(t => t.id)).toEqual(['1']);
  });

  it('AND-combines status + priority + search', () => {
    const result = filterTickets(tickets, { status: 'open', priority: 'high', search: 'login' });
    expect(result.map(t => t.id)).toEqual(['1']);
  });

  it('search is case-insensitive across title, description, assignee, tags', () => {
    // 'AUTH' should match either the description ('auth-related') or the tag ('auth').
    const result = filterTickets(tickets, { search: 'AUTH' });
    expect(result.map(t => t.id).sort()).toEqual(['3', '4']);
  });

  it('search that matches nothing returns an empty array', () => {
    const result = filterTickets(tickets, { search: 'no-such-string' });
    expect(result).toEqual([]);
  });

  it('empty tickets array returns empty regardless of filters', () => {
    expect(filterTickets([], { status: 'open', priority: 'high', search: 'x' })).toEqual([]);
  });
});

describe('createTicket - ID format and uniqueness', () => {
  it('produces a TICKET-<digits> id with at least 4 zero-padded digits', () => {
    const t = createTicket({
      title: 'x',
      description: 'y',
      priority: 'low',
      tags: [],
    });
    expect(t.id).toMatch(/^TICKET-\d{4,}$/);
  });

  it('assigns a strictly greater numeric suffix on each successive call', () => {
    const t1 = createTicket({ title: 'a', description: 'b', priority: 'low', tags: [] });
    const t2 = createTicket({ title: 'a', description: 'b', priority: 'low', tags: [] });
    const t3 = createTicket({ title: 'a', description: 'b', priority: 'low', tags: [] });

    const suffix = (id: string) => Number(id.split('-')[1]);
    expect(suffix(t2.id)).toBeGreaterThan(suffix(t1.id));
    expect(suffix(t3.id)).toBeGreaterThan(suffix(t2.id));
  });

  it('treats an empty-string assignee as undefined (not "")', () => {
    const t = createTicket({
      title: 'a',
      description: 'b',
      priority: 'low',
      assignee: '   ',
      tags: [],
    });
    expect(t.assignee).toBeUndefined();
  });

  it('drops blank tags and trims surviving tags', () => {
    const t = createTicket({
      title: 'a',
      description: 'b',
      priority: 'low',
      tags: ['  frontend ', '   ', '', 'bug'],
    });
    expect(t.tags).toEqual(['frontend', 'bug']);
  });
});

describe('getTicketStats - empty and single-status inputs', () => {
  it('returns all-zero counts for an empty array', () => {
    expect(getTicketStats([])).toEqual({
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      critical: 0,
    });
  });

  it('counts a single critical/open ticket correctly', () => {
    const stats = getTicketStats([
      makeTicket({ status: 'open', priority: 'critical' }),
    ]);
    expect(stats).toEqual({
      total: 1,
      open: 1,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      critical: 1,
    });
  });
});
