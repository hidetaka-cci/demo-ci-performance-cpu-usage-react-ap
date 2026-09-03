/**
 * Property-Based Tests for TicketCard.onSelect coverage
 *
 * TicketCard.tsx line 79 (`onClick={() => onSelect?.(ticket.id)}`) は
 * 通常のレンダリングテストでは実行されないため、専用のインタラクション
 * テストで onSelect ハンドラのカバレッジを確保する。
 *
 * ※ try/finally + within(container) で DOM リークを防止。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketCard } from '../components/TicketCard';
import type { Ticket, Priority, Status } from '../types/ticket';

const NUM_RUNS = 50;

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

describe('TicketCard - onSelect interaction', () => {
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
          const titleEl = within(container).getByTestId('ticket-title');
          fireEvent.click(titleEl);
          expect(onSelect).toHaveBeenCalledOnce();
          expect(onSelect).toHaveBeenCalledWith(ticket.id);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('onSelect が未指定でもタイトルをクリックしてクラッシュしない', () => {
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
          const titleEl = within(container).getByTestId('ticket-title');
          expect(() => fireEvent.click(titleEl)).not.toThrow();
          expect(titleEl).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('onSelect 指定時はタイトルにアンダーラインとポインタカーソルが付く', () => {
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
          const titleEl = within(container).getByTestId('ticket-title') as HTMLElement;
          expect(titleEl.style.cursor).toBe('pointer');
          expect(titleEl.style.textDecoration).toBe('underline');
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('onSelect 未指定時はタイトルに default カーソルが付く', () => {
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
          const titleEl = within(container).getByTestId('ticket-title') as HTMLElement;
          expect(titleEl.style.cursor).toBe('default');
          expect(titleEl.style.textDecoration).toBe('none');
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
