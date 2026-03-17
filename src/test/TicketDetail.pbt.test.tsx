/**
 * Property-Based Tests for TicketDetail component
 *
 * チケット詳細画面（コメント一覧 + コメント追加フォーム）のテスト。
 * App 統合テストと同様に jsdom 上でフル render するため
 * numRuns に比例した CPU 負荷が発生します。
 */

import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketDetail } from '../components/TicketDetail';
import type { Ticket, Comment, Priority, Status } from '../types/ticket';

// ── Arbitraries ────────────────────────────────────────────────────────────────

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

const commentArb: fc.Arbitrary<Comment> = fc.record({
  id: fc.stringMatching(/^COMMENT-\d+$/),
  ticketId: fc.stringMatching(/^TICKET-\d{4}$/),
  author: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  body: fc.string({ minLength: 1, maxLength: 300 }).filter(s => s.trim().length > 0),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
});

// ── numRuns ────────────────────────────────────────────────────────────────────
const NUM_RUNS = 500;

// ── Rendering properties ───────────────────────────────────────────────────────

describe('TicketDetail - rendering properties', () => {
  it('任意のチケットでクラッシュしない', () => {
    fc.assert(
      fc.property(ticketArb, fc.array(commentArb, { maxLength: 10 }), (ticket, comments) => {
        const { unmount, container } = render(
          <TicketDetail
            ticket={ticket}
            comments={comments}
            onAddComment={vi.fn()}
            onClose={vi.fn()}
          />
        );
        try {
          expect(within(container).getByTestId('ticket-detail')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('チケットタイトルが常に表示される', () => {
    fc.assert(
      fc.property(ticketArb, fc.array(commentArb, { maxLength: 5 }), (ticket, comments) => {
        const { unmount, container } = render(
          <TicketDetail
            ticket={ticket}
            comments={comments}
            onAddComment={vi.fn()}
            onClose={vi.fn()}
          />
        );
        try {
          const titleEl = within(container).getByTestId('detail-title');
          expect(titleEl.textContent).toBe(ticket.title);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('チケット説明が常に表示される', () => {
    fc.assert(
      fc.property(ticketArb, fc.array(commentArb, { maxLength: 5 }), (ticket, comments) => {
        const { unmount, container } = render(
          <TicketDetail
            ticket={ticket}
            comments={comments}
            onAddComment={vi.fn()}
            onClose={vi.fn()}
          />
        );
        try {
          const descEl = within(container).getByTestId('detail-description');
          expect(descEl.textContent).toBe(ticket.description);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('コメント件数は渡した配列の長さと一致する', () => {
    fc.assert(
      fc.property(ticketArb, fc.array(commentArb, { maxLength: 15 }), (ticket, comments) => {
        const { unmount, container } = render(
          <TicketDetail
            ticket={ticket}
            comments={comments}
            onAddComment={vi.fn()}
            onClose={vi.fn()}
          />
        );
        try {
          const commentItems = within(container).queryAllByTestId('comment-item');
          expect(commentItems).toHaveLength(comments.length);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('コメントフォームは常に表示される', () => {
    fc.assert(
      fc.property(ticketArb, fc.array(commentArb, { maxLength: 5 }), (ticket, comments) => {
        const { unmount, container } = render(
          <TicketDetail
            ticket={ticket}
            comments={comments}
            onAddComment={vi.fn()}
            onClose={vi.fn()}
          />
        );
        try {
          expect(within(container).getByTestId('comment-form')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('Close ボタンは常に表示される', () => {
    fc.assert(
      fc.property(ticketArb, fc.array(commentArb, { maxLength: 5 }), (ticket, comments) => {
        const { unmount, container } = render(
          <TicketDetail
            ticket={ticket}
            comments={comments}
            onAddComment={vi.fn()}
            onClose={vi.fn()}
          />
        );
        try {
          expect(within(container).getByTestId('detail-close-button')).toBeInTheDocument();
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
      fc.property(ticketWithAssignee, fc.array(commentArb, { maxLength: 5 }), (ticket, comments) => {
        const { unmount, container } = render(
          <TicketDetail
            ticket={ticket}
            comments={comments}
            onAddComment={vi.fn()}
            onClose={vi.fn()}
          />
        );
        try {
          const el = within(container).getByTestId('detail-assignee');
          expect(el.textContent).toBe(ticket.assignee);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── Interaction properties ─────────────────────────────────────────────────────

describe('TicketDetail - interaction properties', () => {
  it('Close ボタンクリックで onClose が呼ばれる', () => {
    fc.assert(
      fc.property(ticketArb, (ticket) => {
        const onClose = vi.fn();
        const { unmount, container } = render(
          <TicketDetail
            ticket={ticket}
            comments={[]}
            onAddComment={vi.fn()}
            onClose={onClose}
          />
        );
        try {
          fireEvent.click(within(container).getByTestId('detail-close-button'));
          expect(onClose).toHaveBeenCalledTimes(1);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('有効なコメント送信で onAddComment が呼ばれる', () => {
    fc.assert(
      fc.property(
        ticketArb,
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        (ticket, author, body) => {
          const onAddComment = vi.fn();
          const { unmount, container } = render(
            <TicketDetail
              ticket={ticket}
              comments={[]}
              onAddComment={onAddComment}
              onClose={vi.fn()}
            />
          );
          try {
            const form = within(container).getByTestId('comment-form');
            fireEvent.change(within(form).getByTestId('comment-author-input'), {
              target: { value: author },
            });
            fireEvent.change(within(form).getByTestId('comment-body-input'), {
              target: { value: body },
            });
            fireEvent.click(within(form).getByTestId('comment-submit-button'));
            expect(onAddComment).toHaveBeenCalledTimes(1);
            expect(onAddComment).toHaveBeenCalledWith({
              author: author.trim(),
              body: body.trim(),
            });
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('author が空のままコメント送信しても onAddComment は呼ばれない', () => {
    fc.assert(
      fc.property(
        ticketArb,
        fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        (ticket, body) => {
          const onAddComment = vi.fn();
          const { unmount, container } = render(
            <TicketDetail
              ticket={ticket}
              comments={[]}
              onAddComment={onAddComment}
              onClose={vi.fn()}
            />
          );
          try {
            const form = within(container).getByTestId('comment-form');
            // author を空のまま body だけ入力
            fireEvent.change(within(form).getByTestId('comment-body-input'), {
              target: { value: body },
            });
            fireEvent.click(within(form).getByTestId('comment-submit-button'));
            expect(onAddComment).not.toHaveBeenCalled();
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });
});
