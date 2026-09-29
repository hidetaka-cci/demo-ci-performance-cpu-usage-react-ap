/**
 * Property-Based Tests for App - detail view flow
 *
 * TicketCard タイトルクリックで詳細ビューに遷移し、コメント追加・
 * Close に伴う戻り遷移までを検証します。
 *
 * これは既存の App.pbt.test.tsx でカバーされていない
 *   - App.tsx: handleAddComment / selectedTicket find / onClose
 *   - TicketCard.tsx: onSelect コールバック
 * を到達させることが目的です。
 *
 * 統合レンダリングを行うため numRuns は控えめ (30) にしています。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 30;

const commentAuthorArb = fc
  .string({ minLength: 1, maxLength: 30 })
  .filter(s => s.trim().length > 0);
const commentBodyArb = fc
  .string({ minLength: 1, maxLength: 120 })
  .filter(s => s.trim().length > 0);

describe('App - detail view navigation properties', () => {
  it('チケットタイトルクリックで詳細ビューに遷移する', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          expect(cards.length).toBeGreaterThan(0);

          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          // 詳細ビューが表示され、リストは非表示になる
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューの Close ボタンでリストに戻る', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          fireEvent.click(q.getByTestId('detail-close-button'));

          // 詳細ビューが閉じてリストが復元される
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
          expect(q.getByTestId('ticket-list')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューでコメントを追加するとカウントが1増える', () => {
    fc.assert(
      fc.property(commentAuthorArb, commentBodyArb, (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          const detail = q.getByTestId('ticket-detail');
          const beforeCount = within(detail).queryAllByTestId('comment-item').length;

          fireEvent.change(within(detail).getByTestId('comment-author-input'), {
            target: { value: author },
          });
          fireEvent.change(within(detail).getByTestId('comment-body-input'), {
            target: { value: body },
          });
          fireEvent.click(within(detail).getByTestId('comment-submit-button'));

          const afterCount = within(detail).queryAllByTestId('comment-item').length;
          expect(afterCount).toBe(beforeCount + 1);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('別のチケットを選択し直すと詳細ビューの内容が切り替わる', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          if (cards.length < 2) return;

          const firstTitleText = within(cards[0]).getByTestId('ticket-title').textContent;
          const secondTitleText = within(cards[1]).getByTestId('ticket-title').textContent;

          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
          const firstDetailTitle = q.getByTestId('detail-title').textContent;
          expect(firstDetailTitle).toBe(firstTitleText);

          // 一度リストに戻り、別のチケットを選択
          fireEvent.click(q.getByTestId('detail-close-button'));
          const cards2 = q.getAllByTestId('ticket-card');
          const secondCard = cards2.find(
            c => within(c).getByTestId('ticket-title').textContent === secondTitleText
          );
          expect(secondCard).toBeTruthy();
          fireEvent.click(within(secondCard!).getByTestId('ticket-title'));

          expect(q.getByTestId('detail-title').textContent).toBe(secondTitleText);
          expect(q.getByTestId('detail-title').textContent).not.toBe(firstDetailTitle);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
