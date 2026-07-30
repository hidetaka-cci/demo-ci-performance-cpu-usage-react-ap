/**
 * Direct unit tests for ticketUtils label and ordering behaviors.
 *
 * The existing PBT suite drives label/ordering code through indirect paths
 * (components render the labels, priority ordering is checked as a property).
 * These example-based tests pin down the exact label strings and lock in the
 * ordering of sortTickets for the 'createdAt' and 'status' modes, which the
 * PBT suite currently does not assert.
 */

import { describe, it, expect } from 'vitest';
import {
  getPriorityLabel,
  getStatusLabel,
  sortTickets,
  filterTickets,
  getTicketStats,
} from '../utils/ticketUtils';
import type { Priority, Status, Ticket } from '../types/ticket';

// ── Test fixture ──────────────────────────────────────────────────────────────

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: overrides.id ?? 'TICKET-9999',
    title: overrides.title ?? 'sample title',
    description: overrides.description ?? 'sample description',
    priority: overrides.priority ?? 'medium',
    status: overrides.status ?? 'open',
    createdAt: overrides.createdAt ?? new Date('2024-01-01T00:00:00Z'),
    updatedAt: overrides.updatedAt ?? new Date('2024-01-01T00:00:00Z'),
    assignee: overrides.assignee,
    tags: overrides.tags ?? [],
  };
}

// ── getPriorityLabel ──────────────────────────────────────────────────────────

describe('getPriorityLabel', () => {
  it.each<[Priority, string]>([
    ['low', 'Low'],
    ['medium', 'Medium'],
    ['high', 'High'],
    ['critical', 'Critical'],
  ])('%s → %s', (priority, expected) => {
    expect(getPriorityLabel(priority)).toBe(expected);
  });
});

// ── getStatusLabel ────────────────────────────────────────────────────────────

describe('getStatusLabel', () => {
  it.each<[Status, string]>([
    ['open', 'Open'],
    ['in_progress', 'In Progress'],
    ['resolved', 'Resolved'],
    ['closed', 'Closed'],
  ])('%s → %s', (status, expected) => {
    expect(getStatusLabel(status)).toBe(expected);
  });
});

// ── sortTickets: 'createdAt' ──────────────────────────────────────────────────

describe("sortTickets(_, 'createdAt')", () => {
  it('newest createdAt appears first (descending order)', () => {
    const older = makeTicket({ id: 'A', createdAt: new Date('2024-01-01T00:00:00Z') });
    const newer = makeTicket({ id: 'B', createdAt: new Date('2024-06-01T00:00:00Z') });
    const newest = makeTicket({ id: 'C', createdAt: new Date('2025-01-01T00:00:00Z') });

    const sorted = sortTickets([older, newest, newer], 'createdAt');
    expect(sorted.map(t => t.id)).toEqual(['C', 'B', 'A']);
  });

  it('empty array returns an empty array', () => {
    expect(sortTickets([], 'createdAt')).toEqual([]);
  });

  it('single ticket is returned unchanged', () => {
    const t = makeTicket({ id: 'only', createdAt: new Date('2024-01-01T00:00:00Z') });
    expect(sortTickets([t], 'createdAt')).toEqual([t]);
  });
});

// ── sortTickets: 'status' ─────────────────────────────────────────────────────

describe("sortTickets(_, 'status')", () => {
  it('orders open < in_progress < resolved < closed', () => {
    const closed = makeTicket({ id: 'D', status: 'closed' });
    const inProgress = makeTicket({ id: 'B', status: 'in_progress' });
    const resolved = makeTicket({ id: 'C', status: 'resolved' });
    const open = makeTicket({ id: 'A', status: 'open' });

    const sorted = sortTickets([closed, resolved, inProgress, open], 'status');
    expect(sorted.map(t => t.id)).toEqual(['A', 'B', 'C', 'D']);
  });

  it('empty array returns an empty array', () => {
    expect(sortTickets([], 'status')).toEqual([]);
  });
});

// ── filterTickets edge cases ──────────────────────────────────────────────────

describe('filterTickets edge cases', () => {
  it('returns an empty array when the input is empty', () => {
    expect(filterTickets([], { status: 'open' })).toEqual([]);
    expect(filterTickets([], { priority: 'high' })).toEqual([]);
    expect(filterTickets([], { search: 'anything' })).toEqual([]);
    expect(filterTickets([], {})).toEqual([]);
  });

  it('search matches inside assignee (case-insensitive)', () => {
    const withAssignee = makeTicket({ id: 'X', assignee: 'Alice', title: 't', description: 'd' });
    const other = makeTicket({ id: 'Y', assignee: 'Bob', title: 't', description: 'd' });

    const result = filterTickets([withAssignee, other], { search: 'ALIC' });
    expect(result.map(t => t.id)).toEqual(['X']);
  });

  it('search matches inside tags (case-insensitive)', () => {
    const withTag = makeTicket({ id: 'X', tags: ['Frontend'], title: 't', description: 'd' });
    const other = makeTicket({ id: 'Y', tags: ['backend'], title: 't', description: 'd' });

    const result = filterTickets([withTag, other], { search: 'FRONT' });
    expect(result.map(t => t.id)).toEqual(['X']);
  });

  it('search treats undefined assignee as no-match without throwing', () => {
    const t = makeTicket({ id: 'X', title: 't', description: 'd', tags: [] });
    expect(() => filterTickets([t], { search: 'nothing' })).not.toThrow();
    expect(filterTickets([t], { search: 'nothing' })).toEqual([]);
  });

  it('combined status + priority + search filters are ANDed together', () => {
    const match = makeTicket({
      id: 'MATCH',
      status: 'open',
      priority: 'high',
      title: 'crash on login',
      description: 'd',
    });
    const wrongStatus = makeTicket({
      id: 'WS',
      status: 'closed',
      priority: 'high',
      title: 'crash on login',
      description: 'd',
    });
    const wrongPriority = makeTicket({
      id: 'WP',
      status: 'open',
      priority: 'low',
      title: 'crash on login',
      description: 'd',
    });
    const wrongSearch = makeTicket({
      id: 'WQ',
      status: 'open',
      priority: 'high',
      title: 'unrelated',
      description: 'd',
    });

    const result = filterTickets([match, wrongStatus, wrongPriority, wrongSearch], {
      status: 'open',
      priority: 'high',
      search: 'crash',
    });
    expect(result.map(t => t.id)).toEqual(['MATCH']);
  });
});

// ── getTicketStats specific counts ────────────────────────────────────────────

describe('getTicketStats per-bucket counts', () => {
  it('correctly buckets a fixed mix of tickets', () => {
    const tickets: Ticket[] = [
      makeTicket({ id: '1', status: 'open', priority: 'critical' }),
      makeTicket({ id: '2', status: 'open', priority: 'high' }),
      makeTicket({ id: '3', status: 'in_progress', priority: 'medium' }),
      makeTicket({ id: '4', status: 'resolved', priority: 'low' }),
      makeTicket({ id: '5', status: 'closed', priority: 'critical' }),
    ];

    expect(getTicketStats(tickets)).toEqual({
      total: 5,
      open: 2,
      inProgress: 1,
      resolved: 1,
      closed: 1,
      critical: 2,
    });
  });

  it('returns all zeros for an empty ticket list', () => {
    expect(getTicketStats([])).toEqual({
      total: 0,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      critical: 0,
    });
  });
});
