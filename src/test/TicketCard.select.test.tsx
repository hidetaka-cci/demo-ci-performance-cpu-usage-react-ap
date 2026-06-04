/**
 * Coverage tests for TicketCard onSelect callback.
 *
 * Existing tests render TicketCard without an onSelect prop, so the title
 * click handler at TicketCard.tsx:79 is uncovered. These tests exercise that
 * branch with a deterministic + property-based pair.
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

const NUM_RUNS = 50;

const sampleTicket: Ticket = {
  id: 'TICKET-9999',
  title: 'Sample ticket title',
  description: 'Sample description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
};

describe('TicketCard - onSelect callback', () => {
  it('タイトルクリックで onSelect が ticket.id を引数に呼ばれる', () => {
    const onSelect = vi.fn();
    const { container, unmount } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={onSelect}
      />
    );
    try {
      fireEvent.click(within(container).getByTestId('ticket-title'));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(sampleTicket.id);
    } finally {
      unmount();
    }
  });

  it('onSelect 未指定時にタイトルクリックしてもクラッシュしない', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      expect(() =>
        fireEvent.click(within(container).getByTestId('ticket-title'))
      ).not.toThrow();
    } finally {
      unmount();
    }
  });

  it('任意のチケットでタイトルクリックすると onSelect は ticket.id を受け取る', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const onSelect = vi.fn();
        const { container, unmount } = render(
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

  it('onSelect 指定時はタイトルにポインタカーソルと underline が付与される', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
        onSelect={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title.style.cursor).toBe('pointer');
      expect(title.style.textDecoration).toBe('underline');
    } finally {
      unmount();
    }
  });

  it('onSelect 未指定時はタイトルにデフォルトカーソルが付与される', () => {
    const { container, unmount } = render(
      <TicketCard
        ticket={sampleTicket}
        onStatusChange={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    try {
      const title = within(container).getByTestId('ticket-title');
      expect(title.style.cursor).toBe('default');
      expect(title.style.textDecoration).toBe('none');
    } finally {
      unmount();
    }
  });
});
