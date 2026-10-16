/**
 * Additional Property-Based Tests for TicketCard component
 *
 * 既存の TicketCard.pbt.test.tsx では onSelect のタイトルクリック経路
 * (src/components/TicketCard.tsx:79) がカバーされていない。
 * ここでは onSelect prop の有無/クリック時の挙動を検証する。
 *
 * numRuns は既存テスト (500) より小さめにしてテスト時間への影響を抑える。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketCard } from '../components/TicketCard';
import type { Ticket, Priority, Status } from '../types/ticket';

const NUM_RUNS = 30;

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

describe('TicketCard - onSelect interaction properties', () => {
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
          expect(onSelect).toHaveBeenCalledTimes(1);
          expect(onSelect).toHaveBeenCalledWith(ticket.id);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('onSelect が未指定でもタイトルクリックで例外にならない', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const { unmount, container } = render(
          <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
        );
        try {
          const title = within(container).getByTestId('ticket-title');
          expect(() => fireEvent.click(title)).not.toThrow();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('onSelect が渡されるとタイトルは cursor:pointer / underline になる', () => {
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
          expect(title.style.textDecoration).toBe('underline');
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('onSelect が未指定のときタイトルは cursor:default / none になる', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const { unmount, container } = render(
          <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
        );
        try {
          const title = within(container).getByTestId('ticket-title') as HTMLElement;
          expect(title.style.cursor).toBe('default');
          expect(title.style.textDecoration).toBe('none');
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
