/**
 * Property-Based Tests for TicketCard component
 *
 * @testing-library/react + fast-check の組み合わせ。
 * render が jsdom 上で走るため、numRuns に比例して CPU 負荷が増加します。
 *
 * numRuns を変更して CircleCI のリソースクラス効果を体感してください。
 *
 * ※ try/finally + within(container) で DOM リークを防止します。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketCard } from '../components/TicketCard';
import type { Ticket, Priority, Status } from '../types/ticket';

// ── Arbitraries ───────────────────────────────────────────────────────────────

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

// ── numRuns: CI 負荷調整はここ ─────────────────────────────────────────────────
const NUM_RUNS = 500;

// ── Properties ────────────────────────────────────────────────────────────────

describe('TicketCard - rendering properties', () => {
  it('任意のチケットに対してタイトルが必ずレンダリングされる', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const { unmount, container } = render(
          <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
        );
        try {
          const q = within(container);
          const titleEl = q.getByTestId('ticket-title');
          expect(titleEl).toBeInTheDocument();
          expect(titleEl.textContent).toBe(ticket.title);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('任意のチケットに対して説明が必ずレンダリングされる', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const { unmount, container } = render(
          <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
        );
        try {
          const descEl = within(container).getByTestId('ticket-description');
          expect(descEl).toBeInTheDocument();
          expect(descEl.textContent).toBe(ticket.description);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('priority バッジは常に表示される', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const { unmount, container } = render(
          <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
        );
        try {
          const badge = within(container).getByTestId('priority-badge');
          expect(badge).toBeInTheDocument();
          expect(badge.textContent).toBeTruthy();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('status バッジは常に表示される', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const { unmount, container } = render(
          <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
        );
        try {
          const badge = within(container).getByTestId('status-badge');
          expect(badge).toBeInTheDocument();
          expect(badge.textContent).toBeTruthy();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('assignee がある場合は表示される', () => {
    const ticketWithAssignee = ticketArb.filter(t => t.assignee !== undefined);
    fc.assert(
      fc.property(ticketWithAssignee, (ticket) => {
        const { unmount, container } = render(
          <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
        );
        try {
          const assigneeEl = within(container).getByTestId('ticket-assignee');
          expect(assigneeEl).toBeInTheDocument();
          expect(assigneeEl.textContent).toBe(ticket.assignee);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('タグの数だけタグ要素がレンダリングされる', () => {
    // 重複タグを除外してユニークなタグだけ使う
    const uniqueTagsTicketArb = ticketArb.map(t => ({
      ...t,
      tags: [...new Set(t.tags)],
    }));
    fc.assert(
      fc.property(uniqueTagsTicketArb, (ticket) => {
        const { unmount, container } = render(
          <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
        );
        try {
          const tagEls = within(container).queryAllByTestId('ticket-tag');
          expect(tagEls).toHaveLength(ticket.tags.length);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('Delete ボタンは常に表示される', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const { unmount, container } = render(
          <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
        );
        try {
          expect(within(container).getByTestId('delete-button')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('ステータス進行ボタンは常に表示される', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const { unmount, container } = render(
          <TicketCard ticket={ticket} onStatusChange={vi.fn()} onDelete={vi.fn()} />
        );
        try {
          expect(within(container).getByTestId('advance-status-button')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
