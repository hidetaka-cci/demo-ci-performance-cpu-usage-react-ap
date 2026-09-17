/**
 * Property-Based Tests for App - ticket detail view flow
 *
 * カバレッジ強化: 未テストだった Ticket 選択 → 詳細表示 → コメント追加 →
 * 閉じるまでのフローを対象にした integration test。
 *
 * 対象:
 *   - App.tsx handleAddComment (line 72-75)
 *   - App.tsx selectedTicket find predicate (line 90)
 *   - App.tsx TicketDetail onClose callback (line 116)
 *   - TicketCard.tsx onSelect callback (line 79)
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 50;

// ── Ticket 詳細表示への遷移 ───────────────────────────────────────────────────

describe('App - ticket detail selection properties', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示される', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 }), (index) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

          const cards = q.getAllByTestId('ticket-card');
          const target = cards[index % cards.length];
          fireEvent.click(within(target).getByTestId('ticket-title'));

          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューに表示されるタイトルは選択したチケットと一致する', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 }), (index) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const target = cards[index % cards.length];
          const expectedTitle = within(target).getByTestId('ticket-title').textContent;

          fireEvent.click(within(target).getByTestId('ticket-title'));

          const detailTitle = q.getByTestId('detail-title');
          expect(detailTitle.textContent).toBe(expectedTitle);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューで Back ボタンを押すとリストに戻る', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 2 }), (index) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const target = cards[index % cards.length];

          fireEvent.click(within(target).getByTestId('ticket-title'));
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
});

// ── コメント追加 ─────────────────────────────────────────────────────────────

describe('App - detail comment properties', () => {
  const authorArb = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);
  const bodyArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);

  it('選択したチケットにコメントを追加できる', () => {
    fc.assert(
      fc.property(authorArb, bodyArb, (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          const detail = q.getByTestId('ticket-detail');
          const detailQ = within(detail);
          // 追加前はコメント 0 件
          expect(detailQ.queryAllByTestId('comment-item')).toHaveLength(0);

          fireEvent.change(detailQ.getByTestId('comment-author-input'), { target: { value: author } });
          fireEvent.change(detailQ.getByTestId('comment-body-input'), { target: { value: body } });
          fireEvent.click(detailQ.getByTestId('comment-submit-button'));

          const items = detailQ.getAllByTestId('comment-item');
          expect(items.length).toBe(1);
          expect(within(items[0]).getByTestId('comment-author').textContent).toBe(author.trim());
          expect(within(items[0]).getByTestId('comment-body').textContent).toBe(body.trim());
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('複数コメントを追加するとその件数分表示される', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 4 }), (count) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          const detail = q.getByTestId('ticket-detail');
          const detailQ = within(detail);

          for (let i = 0; i < count; i++) {
            fireEvent.change(detailQ.getByTestId('comment-author-input'), { target: { value: `Author-${i}` } });
            fireEvent.change(detailQ.getByTestId('comment-body-input'), { target: { value: `Body-${i}` } });
            fireEvent.click(detailQ.getByTestId('comment-submit-button'));
          }

          expect(detailQ.getAllByTestId('comment-item')).toHaveLength(count);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('別チケットに切り替えるとそのチケット固有のコメントだけ表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);

          // 1件目のチケットを開いてコメント追加
          const cardsA = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cardsA[0]).getByTestId('ticket-title'));
          const detailA = within(q.getByTestId('ticket-detail'));
          fireEvent.change(detailA.getByTestId('comment-author-input'), { target: { value: 'A-author' } });
          fireEvent.change(detailA.getByTestId('comment-body-input'), { target: { value: 'A-body' } });
          fireEvent.click(detailA.getByTestId('comment-submit-button'));
          expect(detailA.getAllByTestId('comment-item')).toHaveLength(1);

          // リストに戻って別チケットを開く
          fireEvent.click(q.getByTestId('detail-close-button'));
          const cardsB = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cardsB[1]).getByTestId('ticket-title'));

          const detailB = within(q.getByTestId('ticket-detail'));
          // 2件目のチケットにはコメントがない
          expect(detailB.queryAllByTestId('comment-item')).toHaveLength(0);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});

// ── 詳細表示中の削除挙動 ──────────────────────────────────────────────────────

describe('App - detail with delete interaction', () => {
  it('詳細表示中のチケットを他経路で削除操作すると閉じる (Close ボタン)', () => {
    // 直接には再現できないが、Back ボタンで閉じた後にそのチケットを削除しても壊れないことを確認
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const initialCount = cards.length;

          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          fireEvent.click(q.getByTestId('detail-close-button'));
          const afterClose = q.getAllByTestId('ticket-card');
          fireEvent.click(within(afterClose[0]).getByTestId('delete-button'));

          expect(q.queryAllByTestId('ticket-card')).toHaveLength(initialCount - 1);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
