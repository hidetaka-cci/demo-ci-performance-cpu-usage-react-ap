/**
 * Property-Based Tests for TicketStats component
 *
 * getTicketStats の出力値と TicketStats のレンダリング結果が
 * 常に一致することをプロパティとして検証します。
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketStats } from '../components/TicketStats';
import { getTicketStats } from '../utils/ticketUtils';
import type { Priority, Status, Ticket } from '../types/ticket';

const NUM_RUNS = 500;

// ── Arbitraries ───────────────────────────────────────────────────────────────

const priorityArb = fc.constantFrom<Priority>('low', 'medium', 'high', 'critical');
const statusArb = fc.constantFrom<Status>('open', 'in_progress', 'resolved', 'closed');

const ticketArb: fc.Arbitrary<Ticket> = fc.record({
  id: fc.string({ minLength: 1 }),
  title: fc.string({ minLength: 1 }),
  description: fc.string({ minLength: 1 }),
  priority: priorityArb,
  status: statusArb,
  createdAt: fc.date(),
  updatedAt: fc.date(),
  assignee: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  tags: fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
});

const statsArb = fc.record({
  total: fc.integer({ min: 0, max: 1000 }),
  open: fc.integer({ min: 0, max: 500 }),
  inProgress: fc.integer({ min: 0, max: 500 }),
  resolved: fc.integer({ min: 0, max: 500 }),
  closed: fc.integer({ min: 0, max: 500 }),
  critical: fc.integer({ min: 0, max: 200 }),
});

// ── Properties ────────────────────────────────────────────────────────────────

describe('TicketStats - rendering properties', () => {
  it('任意の stats 値が正しく表示される', () => {
    fc.assert(
      fc.property(statsArb, (stats) => {
        const { unmount } = render(<TicketStats stats={stats} />);
        expect(screen.getByTestId('stat-total').textContent).toContain(String(stats.total));
        expect(screen.getByTestId('stat-open').textContent).toContain(String(stats.open));
        expect(screen.getByTestId('stat-in-progress').textContent).toContain(String(stats.inProgress));
        expect(screen.getByTestId('stat-resolved').textContent).toContain(String(stats.resolved));
        expect(screen.getByTestId('stat-closed').textContent).toContain(String(stats.closed));
        expect(screen.getByTestId('stat-critical').textContent).toContain(String(stats.critical));
        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('0件の stats でもクラッシュしない', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const stats = { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, critical: 0 };
        const { unmount } = render(<TicketStats stats={stats} />);
        expect(screen.getByTestId('ticket-stats')).toBeInTheDocument();
        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('getTicketStats の結果が TicketStats に渡されると値が一致する', () => {
    fc.assert(
      fc.property(fc.array(ticketArb, { maxLength: 30 }), (tickets) => {
        const stats = getTicketStats(tickets);
        const { unmount } = render(<TicketStats stats={stats} />);
        expect(screen.getByTestId('stat-total').textContent).toContain(String(tickets.length));
        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('stats コンテナは常にレンダリングされる', () => {
    fc.assert(
      fc.property(statsArb, (stats) => {
        const { unmount } = render(<TicketStats stats={stats} />);
        expect(screen.getByTestId('ticket-stats')).toBeInTheDocument();
        unmount();
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
