/**
 * Property-Based Tests for TicketCard - onSelect behavior
 *
 * TicketCard のタイトルクリック挙動 (onSelect) を検証する。
 * 既存の TicketCard.pbt.test.tsx は onSelect を渡さないパターンだけを扱っている。
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

describe('TicketCard - onSelect properties', () => {
  it('onSelect が渡されているとき、タイトルクリックで ticket.id を引数に呼ばれる', () => {
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
          const title = within(container).getByTestId('ticket-title');
          fireEvent.click(title);
          expect(onSelect).toHaveBeenCalledOnce();
          expect(onSelect).toHaveBeenCalledWith(ticket.id);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('onSelect が未指定でも、タイトルクリックはエラーにならない', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const { unmount, container } = render(
          <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
        );
        try {
          const title = within(container).getByTestId('ticket-title');
          // onSelect 未指定でもクリックでスローしない
          expect(() => fireEvent.click(title)).not.toThrow();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('onSelect が渡されているときのみタイトルに underline スタイルが適用される', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        // with onSelect
        const withSelect = render(
          <TicketCard
            ticket={ticket}
            onStatusChange={vi.fn()}
            onDelete={vi.fn()}
            onSelect={vi.fn()}
          />
        );
        try {
          const title = within(withSelect.container).getByTestId('ticket-title');
          expect(title.style.textDecoration).toBe('underline');
          expect(title.style.cursor).toBe('pointer');
        } finally {
          withSelect.unmount();
        }

        // without onSelect
        const withoutSelect = render(
          <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
        );
        try {
          const title = within(withoutSelect.container).getByTestId('ticket-title');
          expect(title.style.textDecoration).toBe('none');
          expect(title.style.cursor).toBe('default');
        } finally {
          withoutSelect.unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
