/**
 * Property-Based Tests for TicketCard's onSelect callback.
 *
 * Existing TicketCard tests never pass or invoke `onSelect`, leaving the
 * click handler on the title (line 79 of TicketCard.tsx) as a 0% covered
 * anonymous function. These tests exercise both branches:
 *   - onSelect provided → clicking the title fires it with ticket.id
 *   - onSelect omitted  → clicking the title is a no-op (does not throw)
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

const NUM_RUNS = 100;

describe('TicketCard - onSelect callback properties', () => {
  it('タイトルをクリックすると onSelect が ticket.id で呼ばれる', () => {
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

  it('onSelect が渡されない場合でもタイトルクリックはクラッシュしない', () => {
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
          const title = within(container).getByTestId('ticket-title');
          expect(() => fireEvent.click(title)).not.toThrow();
          expect(title).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('タイトルを複数回クリックした回数だけ onSelect が呼ばれる', () => {
    fc.assert(
      fc.property(ticketArb, fc.integer({ min: 1, max: 5 }), (ticket, clicks) => {
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
          const title = within(container).getByTestId('ticket-title');
          for (let i = 0; i < clicks; i++) {
            fireEvent.click(title);
          }
          expect(onSelect).toHaveBeenCalledTimes(clicks);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
