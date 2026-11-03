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

describe('TicketCard - interaction callbacks', () => {
  it('Delete ボタンクリックで onDelete が ticket.id で呼ばれる', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const onDelete = vi.fn();
        const { unmount, container } = render(
          <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={onDelete} />
        );
        try {
          fireEvent.click(within(container).getByTestId('delete-button'));
          expect(onDelete).toHaveBeenCalledOnce();
          expect(onDelete).toHaveBeenCalledWith(ticket.id);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('ステータス進行ボタンクリックで onStatusChange が ticket.id と次のステータスで呼ばれる', () => {
    const nextStatus: Record<Status, Status> = {
      open: 'in_progress',
      in_progress: 'resolved',
      resolved: 'closed',
      closed: 'open',
    };
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const onStatusChange = vi.fn();
        const { unmount, container } = render(
          <TicketCard ticket={ticket} onStatusChange={onStatusChange} onDelete={vi.fn()} />
        );
        try {
          fireEvent.click(within(container).getByTestId('advance-status-button'));
          expect(onStatusChange).toHaveBeenCalledOnce();
          expect(onStatusChange).toHaveBeenCalledWith(ticket.id, nextStatus[ticket.status]);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('onSelect が提供されている場合、タイトルクリックで onSelect が ticket.id で呼ばれる', () => {
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

  it('onSelect が未提供の場合、タイトルクリックでエラーが発生しない', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const { unmount, container } = render(
          <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
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
});
