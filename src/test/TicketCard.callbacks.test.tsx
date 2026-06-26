/**
 * Callback / interaction tests for TicketCard component.
 *
 * 既存の TicketCard.pbt.test.tsx は rendering プロパティに特化しているため、
 * ボタンクリック・タイトルクリックなどのコールバック発火経路はこちらでカバーする。
 *
 * カバー対象:
 *   - onSelect (タイトルクリック)
 *   - onStatusChange (advance-status-button)
 *   - onDelete (delete-button)
 *
 * fast-check の numRuns は CI 全体時間を抑えるため控えめに設定。
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
  title: fc.string({ minLength: 1, maxLength: 60 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim().length > 0),
  priority: priorityArb,
  status: statusArb,
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
  assignee: fc.option(
    fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
    { nil: undefined }
  ),
  tags: fc.array(
    fc.string({ minLength: 1, maxLength: 12 }).filter(s => s.trim().length > 0),
    { maxLength: 3 }
  ),
});

describe('TicketCard - callback behavior', () => {
  it('タイトルクリックで onSelect が ticket.id 付きで呼ばれる', () => {
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

  it('onSelect 未指定でもタイトルクリックがクラッシュしない', () => {
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

  it('ステータス進行ボタン押下で onStatusChange が呼ばれ、次のステータスがサイクルに沿う', () => {
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
          <TicketCard
            ticket={ticket}
            onStatusChange={onStatusChange}
            onDelete={vi.fn()}
          />
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

  it('Delete ボタン押下で onDelete が ticket.id 付きで呼ばれる', () => {
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
          expect(onDelete).toHaveBeenCalledOnce();
          expect(onDelete).toHaveBeenCalledWith(ticket.id);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('onSelect 指定時はタイトルが pointer / underline スタイルになる', () => {
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

  it('onSelect 未指定時はタイトルが default / none スタイルになる', () => {
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
          expect(title.style.textDecoration).toBe('none');
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
