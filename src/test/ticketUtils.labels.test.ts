/**
 * Unit tests for label helper functions and sort variants in ticketUtils.
 *
 * These helpers were only exercised indirectly through component tests, so this
 * file adds direct assertions to guarantee the label mappings and every sortBy
 * branch stay covered even if the components ever change.
 */

import { describe, it, expect } from 'vitest';
import {
  getPriorityLabel,
  getStatusLabel,
  sortTickets,
  filterTickets,
} from '../utils/ticketUtils';
import type { Priority, Status, Ticket } from '../types/ticket';

const makeTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: 'TICKET-9001',
  title: 'sample',
  description: 'desc',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  tags: [],
  ...overrides,
});

describe('getPriorityLabel', () => {
  it.each<[Priority, string]>([
    ['low', 'Low'],
    ['medium', 'Medium'],
    ['high', 'High'],
    ['critical', 'Critical'],
  ])('maps %s to %s', (priority, expected) => {
    expect(getPriorityLabel(priority)).toBe(expected);
  });
});

describe('getStatusLabel', () => {
  it.each<[Status, string]>([
    ['open', 'Open'],
    ['in_progress', 'In Progress'],
    ['resolved', 'Resolved'],
    ['closed', 'Closed'],
  ])('maps %s to %s', (status, expected) => {
    expect(getStatusLabel(status)).toBe(expected);
  });
});

describe('sortTickets - createdAt (default) branch', () => {
  it('orders tickets newest-first by createdAt', () => {
    const older = makeTicket({ id: 'TICKET-A', createdAt: new Date('2024-01-01T00:00:00Z') });
    const middle = makeTicket({ id: 'TICKET-B', createdAt: new Date('2024-02-01T00:00:00Z') });
    const newest = makeTicket({ id: 'TICKET-C', createdAt: new Date('2024-03-01T00:00:00Z') });

    const sorted = sortTickets([older, newest, middle], 'createdAt');
    expect(sorted.map(t => t.id)).toEqual(['TICKET-C', 'TICKET-B', 'TICKET-A']);
  });

  it('returns an empty array when input is empty', () => {
    expect(sortTickets([], 'createdAt')).toEqual([]);
  });
});

describe('sortTickets - status branch', () => {
  it('orders open → in_progress → resolved → closed', () => {
    const closed = makeTicket({ id: 'TICKET-CLOSED', status: 'closed' });
    const open = makeTicket({ id: 'TICKET-OPEN', status: 'open' });
    const resolved = makeTicket({ id: 'TICKET-RESOLVED', status: 'resolved' });
    const inProgress = makeTicket({ id: 'TICKET-INPROG', status: 'in_progress' });

    const sorted = sortTickets([closed, open, resolved, inProgress], 'status');
    expect(sorted.map(t => t.status)).toEqual(['open', 'in_progress', 'resolved', 'closed']);
  });
});

describe('filterTickets - search across every field', () => {
  const base: Ticket[] = [
    makeTicket({ id: 'T-title', title: 'Login bug', description: 'x', tags: [] }),
    makeTicket({ id: 'T-desc', title: 'x', description: 'Something about login', tags: [] }),
    makeTicket({ id: 'T-assignee', title: 'x', description: 'x', assignee: 'Login-Alice', tags: [] }),
    makeTicket({ id: 'T-tag', title: 'x', description: 'x', tags: ['LOGIN-related'] }),
    makeTicket({ id: 'T-nomatch', title: 'x', description: 'x', tags: ['other'] }),
  ];

  it('matches when the search term appears in the title (case-insensitive)', () => {
    const result = filterTickets(base, { search: 'LOGIN' });
    expect(result.map(t => t.id)).toEqual(
      expect.arrayContaining(['T-title', 'T-desc', 'T-assignee', 'T-tag']),
    );
    expect(result.map(t => t.id)).not.toContain('T-nomatch');
  });

  it('returns empty when nothing matches the search term', () => {
    const result = filterTickets(base, { search: 'nonexistent-query-string' });
    expect(result).toEqual([]);
  });

  it('handles tickets without assignee without throwing', () => {
    const noAssignee = makeTicket({ id: 'T-noassign', assignee: undefined, title: 'special-marker' });
    const result = filterTickets([noAssignee], { search: 'special-marker' });
    expect(result).toHaveLength(1);
  });

  it('combines status and priority filters (both must match)', () => {
    const tickets = [
      makeTicket({ id: 'T1', status: 'open', priority: 'high' }),
      makeTicket({ id: 'T2', status: 'open', priority: 'low' }),
      makeTicket({ id: 'T3', status: 'closed', priority: 'high' }),
    ];
    const result = filterTickets(tickets, { status: 'open', priority: 'high' });
    expect(result.map(t => t.id)).toEqual(['T1']);
  });
});
