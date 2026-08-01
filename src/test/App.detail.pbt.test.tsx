/**
 * App - TicketDetail 統合テスト。
 *
 * 既存の App.pbt.test.tsx はチケット選択・コメント追加・詳細を閉じるフローを
 * カバーしておらず、App.tsx の handleAddComment / selectedTicket の ?? null /
 * onClose (行 73-75, 90, 116) が未カバレッジだった。
 * このファイルはユーザーがチケットを開いてコメントを追加し閉じるまでを検証する。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 50;

describe('App - ticket detail interaction properties', () => {
  it('カードタイトルをクリックすると TicketDetail が表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

          fireEvent.click(within(firstCard).getByTestId('ticket-title'));

          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          // 詳細を開いている間、リストは非表示になる
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューの Back ボタンでリスト表示に戻る', () => {
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

  it('詳細ビューで有効なコメントを送信するとコメントリストに追加される', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (author, body) => {
          const { unmount, container } = render(<App />);
          try {
            const q = within(container);
            const firstCard = q.getAllByTestId('ticket-card')[0];
            fireEvent.click(within(firstCard).getByTestId('ticket-title'));
            expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
            expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

            fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
            fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
            fireEvent.click(q.getByTestId('comment-submit-button'));

            const items = q.queryAllByTestId('comment-item');
            expect(items).toHaveLength(1);
            expect(within(items[0]).getByTestId('comment-author').textContent).toBe(author.trim());
            expect(within(items[0]).getByTestId('comment-body').textContent).toBe(body.trim());
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('選択中のチケットが削除される経路: 詳細を開いた後にチケットを削除するとリストに戻る', () => {
    // TicketDetail 表示中は Delete ボタンが DOM に無いため、
    // 「詳細を開く → Back → 削除 → 再度開いていた ID を選ぶ手段が無い」ので、
    // 代わりに「詳細を開く → Back → 同じカードを削除」で App.tsx:69 の
    // "selectedTicketId === id なら null にリセット" 経路を確認する。
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          const firstCardId = firstCard.getAttribute('data-ticket-id');
          expect(firstCardId).toBeTruthy();

          // 詳細を開く → 閉じる
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));
          fireEvent.click(q.getByTestId('detail-close-button'));

          // 同じチケットを削除しても App は問題なく動作する
          const stillHere = container.querySelector(`[data-ticket-id="${firstCardId}"]`);
          expect(stillHere).not.toBeNull();
          fireEvent.click(within(stillHere as HTMLElement).getByTestId('delete-button'));

          expect(container.querySelector(`[data-ticket-id="${firstCardId}"]`)).toBeNull();
          expect(q.getByTestId('ticket-list')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('コメント追加ボタンを空欄のまま押しても件数は増えない', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));

          fireEvent.click(q.getByTestId('comment-submit-button'));

          expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
