/**
 * Property-Based Tests for TicketCard onSelect callback
 *
 * Covers TicketCard.tsx line 79 (title click → onSelect?.(ticket.id))
 * which is not exercised by the existing TicketCard test file (it does not
 * pass an onSelect prop).
 *
 * ※ try/finally + within(container) で DOM リークを防止します。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketCard } from '../components/TicketCard';
import type { Ticket, Priority, Status } from '../types/ticket';

const NUM_RUNS = 100;

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

describe('TicketCard - onSelect callback properties', () => {
  it('onSelect が渡されている場合、タイトルクリックで ticket.id とともに呼ばれる', () => {
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

  it('onSelect が渡されていない場合でもタイトルクリックはクラッシュしない', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const { unmount, container } = render(
          <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
        );
        try {
          const titleEl = within(container).getByTestId('ticket-title');
          // onSelect が undefined でも例外を投げない (optional chaining)
          expect(() => fireEvent.click(titleEl)).not.toThrow();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('onSelect の有無で title 要素の cursor スタイルが切り替わる', () => {
    fc.assert(
      fc.property(ticketArb, fc.boolean(), (ticket, provideOnSelect) => {
        const props = provideOnSelect
          ? { onSelect: vi.fn() }
          : {};
        const { unmount, container } = render(
          <TicketCard
            ticket={ticket}
            onStatusChange={vi.fn()}
            onDelete={vi.fn()}
            {...props}
          />
        );
        try {
          const titleEl = within(container).getByTestId('ticket-title') as HTMLElement;
          if (provideOnSelect) {
            expect(titleEl.style.cursor).toBe('pointer');
          } else {
            expect(titleEl.style.cursor).toBe('default');
          }
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
