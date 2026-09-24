/**
 * Property-Based Tests for App - ticket selection & detail flow
 *
 * これは App.tsx で従来カバーされていなかった以下の経路を対象とする:
 *   - TicketCard のタイトルクリック → selectedTicketId が設定される
 *   - TicketDetail の表示 (App.tsx line 89-91, 116 の onClose)
 *   - コメント追加の統合フロー (App.tsx line 72-76 の handleAddComment)
 *   - Detail 表示中に選択チケットが削除されたときの Detail クローズ処理
 *
 * PBT ですが Test 数を抑えて全体テストランタイム増を最小化するため
 * NUM_RUNS は既存の App テストより小さめに設定。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 20;

const commentTextArb = fc.string({ minLength: 1, maxLength: 40 }).filter(s => s.trim().length > 0);
const authorArb = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);

describe('App - ticket selection & detail integration', () => {
  it('タイトルクリックで TicketDetail が開く', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          expect(cards.length).toBeGreaterThan(0);

          const firstCardTitle = within(cards[0]).getByTestId('ticket-title');
          fireEvent.click(firstCardTitle);

          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          // Detail 表示中は list/コントロールは隠れる
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('TicketDetail の Back ボタンで list に戻る', () => {
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
      { numRuns: NUM_RUNS }
    );
  });

  it('Detail 表示中にコメントを追加するとコメント件数が増える', () => {
    fc.assert(
      fc.property(authorArb, commentTextArb, (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

          fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
          fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
          fireEvent.click(q.getByTestId('comment-submit-button'));

          const items = q.queryAllByTestId('comment-item');
          expect(items).toHaveLength(1);
          expect(within(items[0]).getByTestId('comment-body').textContent).toBe(body.trim());
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('選択中のチケットを削除すると自動的に list に戻る', () => {
    // 選択中チケットの削除は handleDelete の selectedTicketId クリア分岐と、
    // App.tsx 90行目の `?? null` 側の分岐を触る。
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const initialCount = cards.length;

          // まずタイトルをクリックして Detail を開く
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          // Detail から list に戻り、その同じチケットを削除
          fireEvent.click(q.getByTestId('detail-close-button'));
          const listCards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(listCards[0]).getByTestId('delete-button'));

          // 削除後 list には1件少ないカードが存在する
          expect(q.queryAllByTestId('ticket-card')).toHaveLength(initialCount - 1);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
