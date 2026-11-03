import { describe, it, expect, vi } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { TicketDetail } from '../components/TicketDetail';
import type { Ticket } from '../types/ticket';

const baseTicket: Ticket = {
  id: 'TICKET-0001',
  title: 'Test Ticket',
  description: 'Test description',
  priority: 'medium',
  status: 'open',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  tags: [],
};

const nonEmptyStr = (max = 100) =>
  fc.string({ minLength: 1, maxLength: max }).filter(s => s.trim().length > 0);

const NUM_RUNS = 100;

describe('TicketDetail - CommentForm body validation', () => {
  it('body が空のまま送信すると onAddComment は呼ばれない', () => {
    fc.assert(
      fc.property(nonEmptyStr(50), (author) => {
        const onAddComment = vi.fn();
        const { unmount, container } = render(
          <TicketDetail
            ticket={baseTicket}
            comments={[]}
            onAddComment={onAddComment}
            onClose={vi.fn()}
          />
        );
        try {
          const q = within(container);
          fireEvent.change(q.getByTestId('comment-author-input'), {
            target: { value: author },
          });
          // body は空のまま
          fireEvent.click(q.getByTestId('comment-submit-button'));
          expect(onAddComment).not.toHaveBeenCalled();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('author が空のまま送信すると onAddComment は呼ばれない（既存動作の確認）', () => {
    fc.assert(
      fc.property(nonEmptyStr(100), (body) => {
        const onAddComment = vi.fn();
        const { unmount, container } = render(
          <TicketDetail
            ticket={baseTicket}
            comments={[]}
            onAddComment={onAddComment}
            onClose={vi.fn()}
          />
        );
        try {
          const q = within(container);
          fireEvent.change(q.getByTestId('comment-body-input'), {
            target: { value: body },
          });
          // author は空のまま
          fireEvent.click(q.getByTestId('comment-submit-button'));
          expect(onAddComment).not.toHaveBeenCalled();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('author も body も空白のみの場合、onAddComment は呼ばれない', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const onAddComment = vi.fn();
        const { unmount, container } = render(
          <TicketDetail
            ticket={baseTicket}
            comments={[]}
            onAddComment={onAddComment}
            onClose={vi.fn()}
          />
        );
        try {
          const q = within(container);
          fireEvent.change(q.getByTestId('comment-author-input'), {
            target: { value: '   ' },
          });
          fireEvent.change(q.getByTestId('comment-body-input'), {
            target: { value: '   ' },
          });
          fireEvent.click(q.getByTestId('comment-submit-button'));
          expect(onAddComment).not.toHaveBeenCalled();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('有効な author と body で送信すると onAddComment が呼ばれ入力がリセットされる', () => {
    fc.assert(
      fc.property(nonEmptyStr(50), nonEmptyStr(200), (author, body) => {
        const onAddComment = vi.fn();
        const { unmount, container } = render(
          <TicketDetail
            ticket={baseTicket}
            comments={[]}
            onAddComment={onAddComment}
            onClose={vi.fn()}
          />
        );
        try {
          const q = within(container);
          fireEvent.change(q.getByTestId('comment-author-input'), {
            target: { value: author },
          });
          fireEvent.change(q.getByTestId('comment-body-input'), {
            target: { value: body },
          });
          fireEvent.click(q.getByTestId('comment-submit-button'));
          expect(onAddComment).toHaveBeenCalledOnce();
          const submitted = onAddComment.mock.calls[0][0];
          expect(submitted.author).toBe(author.trim());
          expect(submitted.body).toBe(body.trim());
          // フォームがリセットされる
          expect((q.getByTestId('comment-author-input') as HTMLInputElement).value).toBe('');
          expect((q.getByTestId('comment-body-input') as HTMLTextAreaElement).value).toBe('');
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
