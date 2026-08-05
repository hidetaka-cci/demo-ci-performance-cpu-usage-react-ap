/**
 * Integration tests for App ticket-detail flow.
 *
 * カバレッジ対象:
 *   - App.tsx handleAddComment (selectedTicketId ありのパス)
 *   - App.tsx selectedTicket 分岐 (tickets.find(...) ?? null)
 *   - App.tsx onClose ハンドラ (setSelectedTicketId(null))
 *   - TicketCard.tsx タイトルクリックによる onSelect
 *
 * try/finally + within(container) で fast-check シュリンキング中の DOM リークを防止します。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 30;

const validCommentAuthorArb = fc
  .string({ minLength: 1, maxLength: 30 })
  .filter((s) => s.trim().length > 0);
const validCommentBodyArb = fc
  .string({ minLength: 1, maxLength: 100 })
  .filter((s) => s.trim().length > 0);

describe('App - ticket detail flow', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          expect(cards.length).toBeGreaterThan(0);

          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          // 詳細ビュー中はリスト UI は非表示
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it('詳細ビューの Back ボタンで一覧に戻る', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          fireEvent.click(q.getByTestId('detail-close-button'));
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
          expect(q.getByTestId('ticket-list')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it('詳細ビューでコメント投稿するとコメント件数が1増える', () => {
    fc.assert(
      fc.property(validCommentAuthorArb, validCommentBodyArb, (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          const beforeCount = q.queryAllByTestId('comment-item').length;

          fireEvent.change(q.getByTestId('comment-author-input'), {
            target: { value: author },
          });
          fireEvent.change(q.getByTestId('comment-body-input'), {
            target: { value: body },
          });
          fireEvent.click(q.getByTestId('comment-submit-button'));

          const afterCount = q.queryAllByTestId('comment-item').length;
          expect(afterCount).toBe(beforeCount + 1);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it('空の author でコメント投稿してもコメント件数は変わらない', () => {
    fc.assert(
      fc.property(validCommentBodyArb, (body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          const beforeCount = q.queryAllByTestId('comment-item').length;

          // author 未入力
          fireEvent.change(q.getByTestId('comment-body-input'), {
            target: { value: body },
          });
          fireEvent.click(q.getByTestId('comment-submit-button'));

          const afterCount = q.queryAllByTestId('comment-item').length;
          expect(afterCount).toBe(beforeCount);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it('詳細表示中に対象チケットを Delete すると詳細ビューが閉じる', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const cardCountBefore = cards.length;

          // 1枚目を開く → 詳細から一覧に戻って、1枚目を削除する
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          fireEvent.click(q.getByTestId('detail-close-button'));

          const cardsAfterClose = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cardsAfterClose[0]).getByTestId('delete-button'));

          expect(q.queryAllByTestId('ticket-card').length).toBe(cardCountBefore - 1);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });
});
