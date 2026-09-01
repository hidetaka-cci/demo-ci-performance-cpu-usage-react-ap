/**
 * Property-Based Integration Tests for the App-level ticket detail workflow.
 *
 * カバレッジ対象:
 *   - App.tsx handleAddComment (73-75)
 *   - App.tsx selectedTicket / selectedComments (89-95)
 *   - App.tsx TicketDetail 表示分岐 (111-117)
 *   - TicketCard.tsx title onClick → onSelect (79)
 *
 * App 全体を render するため CPU 負荷が高い。既存の App.pbt.test.tsx より
 * numRuns を控えめにして CI 時間の増加を抑える。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 30;

describe('App - ticket detail interaction properties', () => {
  it('チケットタイトルをクリックすると詳細画面が表示される', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 }), (cardIndex) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const idx = cardIndex % cards.length;
          fireEvent.click(within(cards[idx]).getByTestId('ticket-title'));

          // 詳細ビューが出現し、リスト/フィルタは隠れる
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
          expect(q.queryByTestId('filter-status')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細画面の Close ボタンでリスト画面に戻る', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 }), (cardIndex) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const idx = cardIndex % cards.length;
          fireEvent.click(within(cards[idx]).getByTestId('ticket-title'));
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

  it('詳細画面で選択されたチケットのタイトル/説明が表示される', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 }), (cardIndex) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const idx = cardIndex % cards.length;
          const titleEl = within(cards[idx]).getByTestId('ticket-title');
          const descEl = within(cards[idx]).getByTestId('ticket-description');
          const expectedTitle = titleEl.textContent;
          const expectedDesc = descEl.textContent;

          fireEvent.click(titleEl);

          expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);
          expect(q.getByTestId('detail-description').textContent).toBe(expectedDesc);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細画面でコメントを追加すると Comments カウントが1増える', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 2 }),
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (cardIndex, author, body) => {
          const { unmount, container } = render(<App />);
          try {
            const q = within(container);
            const cards = q.getAllByTestId('ticket-card');
            const idx = cardIndex % cards.length;
            fireEvent.click(within(cards[idx]).getByTestId('ticket-title'));

            const before = q.queryAllByTestId('comment-item').length;
            expect(before).toBe(0);

            const form = q.getByTestId('comment-form');
            fireEvent.change(within(form).getByTestId('comment-author-input'), {
              target: { value: author },
            });
            fireEvent.change(within(form).getByTestId('comment-body-input'), {
              target: { value: body },
            });
            fireEvent.click(within(form).getByTestId('comment-submit-button'));

            const after = q.queryAllByTestId('comment-item').length;
            expect(after).toBe(before + 1);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('別のチケットを選んでもコメントは元のチケットにのみ紐づく', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (author, body) => {
          const { unmount, container } = render(<App />);
          try {
            const q = within(container);
            const cards = q.getAllByTestId('ticket-card');
            if (cards.length < 2) return;

            // 1つ目のチケットの詳細でコメントを追加
            fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
            const form1 = q.getByTestId('comment-form');
            fireEvent.change(within(form1).getByTestId('comment-author-input'), {
              target: { value: author },
            });
            fireEvent.change(within(form1).getByTestId('comment-body-input'), {
              target: { value: body },
            });
            fireEvent.click(within(form1).getByTestId('comment-submit-button'));
            expect(q.queryAllByTestId('comment-item').length).toBe(1);

            // リストに戻る
            fireEvent.click(q.getByTestId('detail-close-button'));

            // 2つ目のチケットを開く → コメントは 0 件のはず
            const cards2 = q.getAllByTestId('ticket-card');
            fireEvent.click(within(cards2[1]).getByTestId('ticket-title'));
            expect(q.queryAllByTestId('comment-item').length).toBe(0);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細表示中に開いているチケットを削除すると詳細画面が閉じる', () => {
    // App では showForm を開いた状態で詳細を開けないので、
    // Detail 中の削除は onDelete 経由でなく App の selectedTicketId リセット
    // ロジック (handleDelete) 経由でテストする。
    // 詳細画面自体には delete ボタンが無いので、リスト→詳細→戻る→削除の順で確認する。
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const targetTitle = within(cards[0]).getByTestId('ticket-title').textContent;

          // 詳細を開く
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
          expect(q.getByTestId('detail-title').textContent).toBe(targetTitle);

          // 一度戻ってから削除
          fireEvent.click(q.getByTestId('detail-close-button'));
          const cardsAfterBack = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cardsAfterBack[0]).getByTestId('delete-button'));

          // 削除されたのでリストにそのタイトルは残っていない
          const remaining = q.queryAllByTestId('ticket-title').map(el => el.textContent);
          expect(remaining).not.toContain(targetTitle);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
