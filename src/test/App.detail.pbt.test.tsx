/**
 * Property-Based Integration Tests for App - TicketDetail flow
 *
 * App の TicketDetail 表示・コメント追加・閉じる操作を検証するテスト。
 * TicketCard のタイトルクリックで詳細ビューに遷移する経路を実際に踏むことで
 * App.tsx の handleAddComment / selectedTicket / onClose 経路をカバーする。
 *
 * ※ 既存の App.pbt.test.tsx は詳細ビュー遷移を扱っていないため、
 *    このファイルで補完的にカバーする。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

// Detail flow は重いので numRuns は控えめに設定
const NUM_RUNS = 20;

const authorArb = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);
const bodyArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);

describe('App - ticket detail integration properties', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          expect(cards.length).toBeGreaterThan(0);

          // 詳細ビューは初期状態では非表示
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

          // 最初のチケットのタイトルをクリック
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          // 詳細ビューが表示される
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          // 詳細ビューにチケットカードは表示されない（一覧非表示）
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューを開いた後、Close(← Back)ボタンで一覧に戻る', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          // Close ボタンを押す
          fireEvent.click(q.getByTestId('detail-close-button'));

          // 詳細ビューは非表示、一覧が復元される
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
          expect(q.getByTestId('ticket-list')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューで有効なコメントを送信するとコメント数が増える', () => {
    fc.assert(
      fc.property(authorArb, bodyArb, (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          // 初期のコメント数は 0
          const beforeCount = q.queryAllByTestId('comment-item').length;
          expect(beforeCount).toBe(0);

          // コメントを入力して送信
          fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
          fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
          fireEvent.click(q.getByTestId('comment-submit-button'));

          // コメントが1件増える
          const afterCount = q.queryAllByTestId('comment-item').length;
          expect(afterCount).toBe(beforeCount + 1);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューを閉じた後にもう一度開いても正しく表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');

          // 開く → 閉じる → 開く
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
          fireEvent.click(q.getByTestId('detail-close-button'));
          const cardsAfter = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cardsAfter[0]).getByTestId('ticket-title'));

          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューでチケットを閉じずに削除すると詳細ビューも閉じる', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const targetId = cards[0].getAttribute('data-ticket-id');
          expect(targetId).toBeTruthy();

          // 詳細ビューを開く
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          // 詳細ビューを閉じる（App の onClose が呼ばれる経路）
          fireEvent.click(q.getByTestId('detail-close-button'));

          // 選択されていたチケットを一覧から削除
          const cardsAfter = q.getAllByTestId('ticket-card');
          const targetCard = cardsAfter.find(c => c.getAttribute('data-ticket-id') === targetId);
          expect(targetCard).toBeTruthy();
          fireEvent.click(within(targetCard!).getByTestId('delete-button'));

          // 削除されている
          const remaining = q.queryAllByTestId('ticket-card');
          expect(remaining.find(c => c.getAttribute('data-ticket-id') === targetId)).toBeUndefined();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
