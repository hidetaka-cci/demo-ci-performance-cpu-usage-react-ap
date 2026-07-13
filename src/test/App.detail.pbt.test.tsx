/**
 * Property-Based Integration Tests for App - Ticket Detail View
 *
 * App の TicketCard タイトルクリック → TicketDetail への遷移と、
 * その中でのコメント追加・Close ボタン操作を検証します。
 * 既存の App.pbt.test.tsx ではカバーされていない、
 *   - App.handleAddComment (App.tsx L73-75)
 *   - onClose インラインコールバック (App.tsx L116)
 *   - TicketCard の onSelect インラインコールバック (TicketCard.tsx L79)
 * をカバーします。
 *
 * ※ try/finally + within(container) で fast-check シュリンキング中の DOM
 *    リークを防止します。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 30;

const validNonEmptyStrArb = (max: number) =>
  fc.string({ minLength: 1, maxLength: max }).filter(s => s.trim().length > 0);

describe('App - detail view interaction', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));

          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューの Close(← Back) ボタンでリストビューに戻る', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          fireEvent.click(q.getByTestId('detail-close-button'));

          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
          expect(q.getByTestId('ticket-list')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューで有効なコメントを追加すると Comments カウントが 1 増える', () => {
    fc.assert(
      fc.property(
        validNonEmptyStrArb(30),
        validNonEmptyStrArb(100),
        (author, body) => {
          const { unmount, container } = render(<App />);
          try {
            const q = within(container);
            const firstCard = q.getAllByTestId('ticket-card')[0];
            fireEvent.click(within(firstCard).getByTestId('ticket-title'));

            const detail = q.getByTestId('ticket-detail');
            const commentsBefore = within(detail).queryAllByTestId('comment-item').length;

            const form = within(detail).getByTestId('comment-form');
            fireEvent.change(within(form).getByTestId('comment-author-input'), {
              target: { value: author },
            });
            fireEvent.change(within(form).getByTestId('comment-body-input'), {
              target: { value: body },
            });
            fireEvent.click(within(form).getByTestId('comment-submit-button'));

            const commentsAfter = within(q.getByTestId('ticket-detail'))
              .queryAllByTestId('comment-item').length;
            expect(commentsAfter).toBe(commentsBefore + 1);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューで追加したコメントの author と body が表示される', () => {
    fc.assert(
      fc.property(
        validNonEmptyStrArb(30),
        validNonEmptyStrArb(100),
        (author, body) => {
          const { unmount, container } = render(<App />);
          try {
            const q = within(container);
            const firstCard = q.getAllByTestId('ticket-card')[0];
            fireEvent.click(within(firstCard).getByTestId('ticket-title'));

            const detail = q.getByTestId('ticket-detail');
            const form = within(detail).getByTestId('comment-form');
            fireEvent.change(within(form).getByTestId('comment-author-input'), {
              target: { value: author },
            });
            fireEvent.change(within(form).getByTestId('comment-body-input'), {
              target: { value: body },
            });
            fireEvent.click(within(form).getByTestId('comment-submit-button'));

            const updatedDetail = q.getByTestId('ticket-detail');
            const authors = within(updatedDetail)
              .queryAllByTestId('comment-author')
              .map(el => el.textContent);
            const bodies = within(updatedDetail)
              .queryAllByTestId('comment-body')
              .map(el => el.textContent);
            expect(authors).toContain(author.trim());
            expect(bodies).toContain(body.trim());
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('空の author では詳細ビューでコメントは追加されない', () => {
    fc.assert(
      fc.property(validNonEmptyStrArb(100), (body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));

          const detail = q.getByTestId('ticket-detail');
          const before = within(detail).queryAllByTestId('comment-item').length;

          const form = within(detail).getByTestId('comment-form');
          fireEvent.change(within(form).getByTestId('comment-body-input'), {
            target: { value: body },
          });
          fireEvent.click(within(form).getByTestId('comment-submit-button'));

          const after = within(q.getByTestId('ticket-detail'))
            .queryAllByTestId('comment-item').length;
          expect(after).toBe(before);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
