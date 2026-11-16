/**
 * Property-Based Tests for TicketCard - onSelect callback
 *
 * The existing TicketCard.pbt.test.tsx tests rendering but not the
 * optional onSelect callback triggered by clicking the ticket title.
 * This file covers that interaction path.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketCard } from '../components/TicketCard';
import type { Ticket, Priority, Status } from '../types/ticket';

const priorityArb = fc.constantFrom<Priority>('low', 'medium', 'high', 'critical');
const statusArb = fc.constantFrom<Status>('open', 'in_progress', 'resolved', 'closed');

const ticketArb: fc.Arbitrary<Ticket> = fc.record({
  id: fc.stringMatching(/^TICKET-\d{4}$/),
  title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  priority: priorityArb,
  status: statusArb,
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
  assignee: fc.option(
    fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    { nil: undefined }
  ),
  tags: fc.array(
    fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
    { maxLength: 5 }
  ),
});

const NUM_RUNS = 200;

describe('TicketCard - onSelect callback properties', () => {
  it('タイトルクリックで onSelect がチケットIDで呼ばれる', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const onSelect = vi.fn();
        const { unmount, container } = render(
          <TicketCard
            ticket={ticket}
            onStatusChange={vi.fn()}
            onDelete={vi.fn()}
            onSelect={onSelect}
          />
        );
        try {
          fireEvent.click(within(container).getByTestId('ticket-title'));
          expect(onSelect).toHaveBeenCalledOnce();
          expect(onSelect).toHaveBeenCalledWith(ticket.id);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('onSelect を渡さなくてもタイトルクリックでクラッシュしない', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const { unmount, container } = render(
          <TicketCard
            ticket={ticket}
            onStatusChange={vi.fn()}
            onDelete={vi.fn()}
          />
        );
        try {
          expect(() => {
            fireEvent.click(within(container).getByTestId('ticket-title'));
          }).not.toThrow();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('onSelect あり: タイトルのカーソルは pointer になる', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const { unmount, container } = render(
          <TicketCard
            ticket={ticket}
            onStatusChange={vi.fn()}
            onDelete={vi.fn()}
            onSelect={vi.fn()}
          />
        );
        try {
          const title = within(container).getByTestId('ticket-title') as HTMLElement;
          expect(title.style.cursor).toBe('pointer');
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('onSelect なし: タイトルのカーソルは default になる', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const { unmount, container } = render(
          <TicketCard
            ticket={ticket}
            onStatusChange={vi.fn()}
            onDelete={vi.fn()}
          />
        );
        try {
          const title = within(container).getByTestId('ticket-title') as HTMLElement;
          expect(title.style.cursor).toBe('default');
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
