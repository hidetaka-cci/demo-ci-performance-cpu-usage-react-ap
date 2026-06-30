/**
 * Property-Based Integration Tests for App - selection / detail / comment flow
 *
 * 既存の App.pbt.test.tsx は一覧→作成→削除→ステータス進行までしか触れず、
 * 以下の経路が 0% カバレッジで残っていた:
 *   - src/App.tsx:72-75 (handleAddComment)
 *   - src/App.tsx:90     (selectedTicketId から ticket を find する lambda)
 *   - src/App.tsx:116    (TicketDetail onClose で setSelectedTicketId(null))
 *   - src/components/TicketCard.tsx:79 (タイトル onClick → onSelect)
 *
 * チケット選択 → 詳細表示 → コメント追加 → 詳細閉じる の往復を E2E 風に検証する。
 *
 * 統合テストのため numRuns は控えめ。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 30;

const nonEmptyShortArb = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);

describe('App - ticket selection flow', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示される', () => {
    fc.assert(
      fc.property(fc.nat({ max: 2 }), (index) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          // 詳細ビューはまだ表示されない
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

          const cards = q.getAllByTestId('ticket-card');
          if (cards.length === 0) return;
          const target = cards[index % cards.length];
          fireEvent.click(within(target).getByTestId('ticket-title'));

          // 詳細ビューが表示される
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          // 一覧 (filter-panel) は非表示
          expect(q.queryByTestId('filter-panel')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューに選択したチケットのタイトル・説明が表示される', () => {
    fc.assert(
      fc.property(fc.nat({ max: 2 }), (index) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          if (cards.length === 0) return;
          const target = cards[index % cards.length];
          const expectedTitle = within(target).getByTestId('ticket-title').textContent;
          const expectedDesc = within(target).getByTestId('ticket-description').textContent;
          fireEvent.click(within(target).getByTestId('ticket-title'));

          const detail = q.getByTestId('ticket-detail');
          const detailTitle = within(detail).getByTestId('detail-title');
          const detailDesc = within(detail).getByTestId('detail-description');
          expect(detailTitle.textContent).toBe(expectedTitle);
          expect(detailDesc.textContent).toBe(expectedDesc);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューの Close ボタンで一覧へ戻る', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          if (cards.length === 0) return;
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          fireEvent.click(q.getByTestId('detail-close-button'));
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
          // 一覧 UI が復帰している
          expect(q.getByTestId('filter-panel')).toBeInTheDocument();
          expect(q.getAllByTestId('ticket-card').length).toBeGreaterThan(0);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

});

describe('App - comment add flow', () => {
  it('詳細ビューで有効なコメントを追加するとコメント件数が増える', () => {
    fc.assert(
      fc.property(nonEmptyShortArb, nonEmptyShortArb, (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          if (cards.length === 0) return;
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          const before = q.queryAllByTestId('comment-item').length;
          fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
          fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
          fireEvent.click(q.getByTestId('comment-submit-button'));

          const after = q.queryAllByTestId('comment-item').length;
          expect(after).toBe(before + 1);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('author 空のままコメント送信してもコメントは追加されない', () => {
    fc.assert(
      fc.property(nonEmptyShortArb, (body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          if (cards.length === 0) return;
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          const before = q.queryAllByTestId('comment-item').length;
          // author は空のまま
          fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
          fireEvent.click(q.getByTestId('comment-submit-button'));

          const after = q.queryAllByTestId('comment-item').length;
          expect(after).toBe(before);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('追加したコメントは、別チケット選択時には表示されない (ticketId スコープ)', () => {
    fc.assert(
      fc.property(nonEmptyShortArb, nonEmptyShortArb, (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          if (cards.length < 2) return;

          // 1枚目を選択しコメント追加
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
          fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
          fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
          fireEvent.click(q.getByTestId('comment-submit-button'));
          expect(q.queryAllByTestId('comment-item').length).toBeGreaterThanOrEqual(1);

          // 一覧に戻り別チケットを選択
          fireEvent.click(q.getByTestId('detail-close-button'));
          const cardsAfter = q.getAllByTestId('ticket-card');
          // 1枚目以外を選択
          const other = cardsAfter.find(c =>
            c.getAttribute('data-ticket-id') !== cards[0].getAttribute('data-ticket-id')
          );
          if (!other) return;
          fireEvent.click(within(other).getByTestId('ticket-title'));

          // 別チケットの詳細ではコメントは表示されない
          expect(q.queryAllByTestId('comment-item').length).toBe(0);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
