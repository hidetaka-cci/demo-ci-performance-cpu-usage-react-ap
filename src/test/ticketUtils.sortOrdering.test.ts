/**
 * Unit tests for sortTickets ordering behaviour.
 *
 * The existing property-based suite in ticketUtils.pbt.test.ts verifies
 * invariants about length, immutability, and the critical-before-high
 * priority ordering. It does NOT exercise the "status" or "createdAt"
 * sort branches, nor does it assert the full ordering invariant.
 *
 * These unit tests directly cover:
 *   - sortTickets('status') ordering across all four statuses
 *   - sortTickets('createdAt') descending (newest-first) ordering
 *   - sortTickets('priority') full ordering (low..critical)
 *   - edge cases: empty array, singleton array, ties
 */

import { describe, it, expect } from 'vitest';
import { sortTickets } from '../utils/ticketUtils';
import type { Priority, Status, Ticket } from '../types/ticket';

const makeTicket = (overrides: Partial<Ticket> & Pick<Ticket, 'id'>): Ticket => ({
  title: 't',
  description: 'd',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
  ...overrides,
});

describe('sortTickets - priority branch', () => {
  it('orders tickets critical -> high -> medium -> low', () => {
    const tickets: Ticket[] = (['low', 'critical', 'medium', 'high'] as Priority[]).map((p, i) =>
      makeTicket({ id: `T-${i}`, priority: p })
    );
    const sorted = sortTickets(tickets, 'priority');
    expect(sorted.map(t => t.priority)).toEqual(['critical', 'high', 'medium', 'low']);
  });

  it('preserves relative order for equal priorities (stable within the sort guarantee of V8)', () => {
    const a = makeTicket({ id: 'A', priority: 'high' });
    const b = makeTicket({ id: 'B', priority: 'high' });
    const c = makeTicket({ id: 'C', priority: 'high' });
    const sorted = sortTickets([a, b, c], 'priority');
    expect(sorted.map(t => t.id)).toEqual(['A', 'B', 'C']);
  });
});

describe('sortTickets - status branch', () => {
  it('orders tickets open -> in_progress -> resolved -> closed', () => {
    const tickets: Ticket[] = (['closed', 'open', 'resolved', 'in_progress'] as Status[]).map(
      (s, i) => makeTicket({ id: `T-${i}`, status: s })
    );
    const sorted = sortTickets(tickets, 'status');
    expect(sorted.map(t => t.status)).toEqual(['open', 'in_progress', 'resolved', 'closed']);
  });

  it('does not reorder when all statuses are equal', () => {
    const tickets: Ticket[] = ['A', 'B', 'C'].map(id => makeTicket({ id, status: 'resolved' }));
    const sorted = sortTickets(tickets, 'status');
    expect(sorted.map(t => t.id)).toEqual(['A', 'B', 'C']);
  });
});

describe('sortTickets - createdAt branch (default)', () => {
  it('orders tickets newest first', () => {
    const tickets: Ticket[] = [
      makeTicket({ id: 'old', createdAt: new Date('2020-01-01') }),
      makeTicket({ id: 'new', createdAt: new Date('2024-06-01') }),
      makeTicket({ id: 'mid', createdAt: new Date('2022-03-15') }),
    ];
    const sorted = sortTickets(tickets, 'createdAt');
    expect(sorted.map(t => t.id)).toEqual(['new', 'mid', 'old']);
  });

  it('places ticket with latest createdAt at index 0', () => {
    const tickets: Ticket[] = Array.from({ length: 5 }, (_, i) =>
      makeTicket({ id: `T-${i}`, createdAt: new Date(2020, 0, i + 1) })
    );
    const sorted = sortTickets(tickets, 'createdAt');
    const latestOriginal = tickets.reduce((acc, cur) =>
      cur.createdAt.getTime() > acc.createdAt.getTime() ? cur : acc
    );
    expect(sorted[0].id).toBe(latestOriginal.id);
  });

  it('handles equal createdAt without crashing or losing elements', () => {
    const sameDate = new Date('2024-01-01');
    const tickets: Ticket[] = ['A', 'B', 'C'].map(id => makeTicket({ id, createdAt: sameDate }));
    const sorted = sortTickets(tickets, 'createdAt');
    expect(sorted).toHaveLength(3);
    expect(new Set(sorted.map(t => t.id))).toEqual(new Set(['A', 'B', 'C']));
  });
});

describe('sortTickets - edge cases', () => {
  it('empty array returns empty array', () => {
    expect(sortTickets([], 'priority')).toEqual([]);
    expect(sortTickets([], 'status')).toEqual([]);
    expect(sortTickets([], 'createdAt')).toEqual([]);
  });

  it('singleton array returns the same single element', () => {
    const t = makeTicket({ id: 'only' });
    expect(sortTickets([t], 'priority')).toEqual([t]);
    expect(sortTickets([t], 'status')).toEqual([t]);
    expect(sortTickets([t], 'createdAt')).toEqual([t]);
  });

  it('returns a new array (does not mutate the input reference)', () => {
    const input: Ticket[] = [makeTicket({ id: 'A' }), makeTicket({ id: 'B' })];
    const output = sortTickets(input, 'priority');
    expect(output).not.toBe(input);
  });

  it('does not mutate the ordering of the original input', () => {
    const input: Ticket[] = [
      makeTicket({ id: 'A', priority: 'low' }),
      makeTicket({ id: 'B', priority: 'critical' }),
    ];
    const originalIds = input.map(t => t.id);
    sortTickets(input, 'priority');
    expect(input.map(t => t.id)).toEqual(originalIds);
  });
});
