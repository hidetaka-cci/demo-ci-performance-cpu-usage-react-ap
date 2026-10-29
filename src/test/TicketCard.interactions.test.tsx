/**
 * Interaction tests for TicketCard component
 *
 * Covers callback paths not exercised by TicketCard.pbt.test.tsx:
 *  - onSelect called when the title is clicked (TicketCard.tsx line 79)
 *  - onSelect optional: no crash when undefined
 *  - onStatusChange called with correct next status
 *  - onDelete called with the ticket id
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketCard } from '../components/TicketCard';
import type { Ticket, Priority, Status } from '../types/ticket';

// ── Arbitraries ────────────────────────────────────────────────────────────────

const priorityArb = fc.constantFrom<Priority>('low', 'medium', 'high', 'critical');
const statusArb = fc.constantFrom<Status>('open', 'in_progress', 'resolved', 'closed');

const ticketArb: fc.Arbitrary<Ticket> = fc.record({
  id: fc.stringMatching(/^TICKET-\d{4}$/),
  title: fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  priority: priorityArb,
  status: statusArb,
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
  assignee: fc.constant(undefined),
  tags: fc.constant([]),
});

const NUM_RUNS = 100;

// ── onSelect (line 79) ─────────────────────────────────────────────────────────

describe('TicketCard - onSelect callback', () => {
  it('タイトルクリックで onSelect が ticket.id と共に呼ばれる', () => {
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

  it('onSelect が渡されていない場合でもタイトルクリックでクラッシュしない', () => {
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
          expect(() => fireEvent.click(within(container).getByTestId('ticket-title'))).not.toThrow();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── onStatusChange ─────────────────────────────────────────────────────────────

describe('TicketCard - onStatusChange callback', () => {
  it('ステータス進行ボタンクリックで onStatusChange が ticket.id と共に呼ばれる', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const onStatusChange = vi.fn();
        const { unmount, container } = render(
          <TicketCard
            ticket={ticket}
            onStatusChange={onStatusChange}
            onDelete={vi.fn()}
          />
        );
        try {
          fireEvent.click(within(container).getByTestId('advance-status-button'));
          expect(onStatusChange).toHaveBeenCalledTimes(1);
          const [calledId] = onStatusChange.mock.calls[0];
          expect(calledId).toBe(ticket.id);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('open → in_progress へステータスが進む', () => {
    const openTicket: Ticket = {
      id: 'TICKET-0001',
      title: 'Open ticket',
      description: 'desc',
      priority: 'low',
      status: 'open',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      tags: [],
    };
    const onStatusChange = vi.fn();
    const { unmount, container } = render(
      <TicketCard ticket={openTicket} onStatusChange={onStatusChange} onDelete={vi.fn()} />
    );
    fireEvent.click(within(container).getByTestId('advance-status-button'));
    expect(onStatusChange).toHaveBeenCalledWith('TICKET-0001', 'in_progress');
    unmount();
  });

  it('closed → open へステータスが循環する', () => {
    const closedTicket: Ticket = {
      id: 'TICKET-0002',
      title: 'Closed ticket',
      description: 'desc',
      priority: 'low',
      status: 'closed',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      tags: [],
    };
    const onStatusChange = vi.fn();
    const { unmount, container } = render(
      <TicketCard ticket={closedTicket} onStatusChange={onStatusChange} onDelete={vi.fn()} />
    );
    fireEvent.click(within(container).getByTestId('advance-status-button'));
    expect(onStatusChange).toHaveBeenCalledWith('TICKET-0002', 'open');
    unmount();
  });
});

// ── onDelete ───────────────────────────────────────────────────────────────────

describe('TicketCard - onDelete callback', () => {
  it('Delete ボタンクリックで onDelete が ticket.id と共に呼ばれる', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const onDelete = vi.fn();
        const { unmount, container } = render(
          <TicketCard
            ticket={ticket}
            onStatusChange={vi.fn()}
            onDelete={onDelete}
          />
        );
        try {
          fireEvent.click(within(container).getByTestId('delete-button'));
          expect(onDelete).toHaveBeenCalledTimes(1);
          expect(onDelete).toHaveBeenCalledWith(ticket.id);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
