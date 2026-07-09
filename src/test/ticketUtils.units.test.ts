import { describe, it, expect } from 'vitest';
import {
  filterTickets,
  sortTickets,
  getPriorityLabel,
  getStatusLabel,
} from '../utils/ticketUtils';
import type { Priority, Status, Ticket } from '../types/ticket';

const makeTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: 'TICKET-9001',
  title: 'Sample',
  description: 'Sample description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  assignee: undefined,
  tags: [],
  ...overrides,
});

describe('getPriorityLabel', () => {
  const cases: [Priority, string][] = [
    ['low', 'Low'],
    ['medium', 'Medium'],
    ['high', 'High'],
    ['critical', 'Critical'],
  ];

  it.each(cases)('returns %s for %s', (priority, expected) => {
    expect(getPriorityLabel(priority)).toBe(expected);
  });
});

describe('getStatusLabel', () => {
  const cases: [Status, string][] = [
    ['open', 'Open'],
    ['in_progress', 'In Progress'],
    ['resolved', 'Resolved'],
    ['closed', 'Closed'],
  ];

  it.each(cases)('returns "%s" for %s', (status, expected) => {
    expect(getStatusLabel(status)).toBe(expected);
  });
});

describe('sortTickets - createdAt branch', () => {
  it('sorts tickets by createdAt descending (newest first)', () => {
    const older = makeTicket({ id: 'A', createdAt: new Date('2024-01-01') });
    const newer = makeTicket({ id: 'B', createdAt: new Date('2024-06-01') });
    const newest = makeTicket({ id: 'C', createdAt: new Date('2025-01-01') });

    const result = sortTickets([older, newer, newest], 'createdAt');

    expect(result.map(t => t.id)).toEqual(['C', 'B', 'A']);
  });

  it('returns an empty array for empty input regardless of sort key', () => {
    expect(sortTickets([], 'createdAt')).toEqual([]);
    expect(sortTickets([], 'priority')).toEqual([]);
    expect(sortTickets([], 'status')).toEqual([]);
  });

  it('preserves single-element input', () => {
    const only = makeTicket({ id: 'X' });
    expect(sortTickets([only], 'createdAt')).toEqual([only]);
  });
});

describe('sortTickets - status branch', () => {
  it('sorts by defined status ordering: open < in_progress < resolved < closed', () => {
    const closed = makeTicket({ id: 'C', status: 'closed' });
    const resolved = makeTicket({ id: 'R', status: 'resolved' });
    const inProgress = makeTicket({ id: 'I', status: 'in_progress' });
    const open = makeTicket({ id: 'O', status: 'open' });

    const result = sortTickets([closed, resolved, inProgress, open], 'status');

    expect(result.map(t => t.status)).toEqual(['open', 'in_progress', 'resolved', 'closed']);
  });
});

describe('sortTickets - priority branch (all four levels)', () => {
  it('orders critical < high < medium < low', () => {
    const low = makeTicket({ id: 'L', priority: 'low' });
    const medium = makeTicket({ id: 'M', priority: 'medium' });
    const high = makeTicket({ id: 'H', priority: 'high' });
    const critical = makeTicket({ id: 'C', priority: 'critical' });

    const result = sortTickets([low, medium, high, critical], 'priority');

    expect(result.map(t => t.priority)).toEqual(['critical', 'high', 'medium', 'low']);
  });
});

describe('filterTickets - combined filters', () => {
  const tickets: Ticket[] = [
    makeTicket({ id: '1', status: 'open', priority: 'critical', title: 'Login bug', tags: ['auth'] }),
    makeTicket({ id: '2', status: 'open', priority: 'low', title: 'Login page tweak', tags: ['ui'] }),
    makeTicket({ id: '3', status: 'closed', priority: 'critical', title: 'Login redirect', tags: ['auth'] }),
    makeTicket({ id: '4', status: 'in_progress', priority: 'high', title: 'Dashboard slowdown', assignee: 'Alice', tags: ['perf'] }),
  ];

  it('applies status and priority filters together', () => {
    const result = filterTickets(tickets, { status: 'open', priority: 'critical' });
    expect(result.map(t => t.id)).toEqual(['1']);
  });

  it('applies status filter with search query', () => {
    const result = filterTickets(tickets, { status: 'open', search: 'login' });
    expect(result.map(t => t.id).sort()).toEqual(['1', '2']);
  });

  it('applies priority filter with search query', () => {
    const result = filterTickets(tickets, { priority: 'critical', search: 'redirect' });
    expect(result.map(t => t.id)).toEqual(['3']);
  });

  it('returns empty when combined filters have no overlap', () => {
    const result = filterTickets(tickets, { status: 'resolved', priority: 'critical' });
    expect(result).toEqual([]);
  });

  it('search matches ticket assignee case-insensitively', () => {
    const result = filterTickets(tickets, { search: 'ALICE' });
    expect(result.map(t => t.id)).toEqual(['4']);
  });

  it('search matches ticket tags case-insensitively', () => {
    const result = filterTickets(tickets, { search: 'AUTH' });
    expect(result.map(t => t.id).sort()).toEqual(['1', '3']);
  });

  it('search matches description case-insensitively', () => {
    const withDesc = makeTicket({ id: 'D', description: 'Deep in the DESCRIPTION lies a clue' });
    const result = filterTickets([...tickets, withDesc], { search: 'clue' });
    expect(result.map(t => t.id)).toEqual(['D']);
  });

  it('returns empty array when no tickets match', () => {
    expect(filterTickets([], { status: 'open' })).toEqual([]);
    expect(filterTickets(tickets, { search: 'nonexistent-query-xyz' })).toEqual([]);
  });

  it('ignores undefined assignee safely during search', () => {
    const noAssignee = makeTicket({ id: 'NA', assignee: undefined, title: 'x', description: 'y', tags: [] });
    const result = filterTickets([noAssignee], { search: 'alice' });
    expect(result).toEqual([]);
  });
});
