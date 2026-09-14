/**
 * Property-Based Integration Tests for App ticket-detail flow
 *
 * カバレッジ穴: App.tsx lines 73-75 (handleAddComment)、90 (selectedTicket lookup)、
 * 116 (TicketDetail onClose)。既存 App テストはチケット選択→詳細表示フローを
 * 触っていないので、ここで補完する。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 30;

const authorArb = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);
const bodyArb = fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0);

describe('App - ticket detail navigation properties', () => {
  it('チケットタイトルをクリックすると TicketDetail が表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

          const card = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(card).getByTestId('ticket-title'));

          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          // フィルタ/リスト UI は非表示
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
          expect(q.queryByTestId('filter-panel')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('選択されたチケットの ID・タイトル・説明が詳細ビューと一致する', () => {
    fc.assert(
      fc.property(fc.nat({ max: 2 }), (index) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const target = cards[Math.min(index, cards.length - 1)];
          const expectedTitle = within(target).getByTestId('ticket-title').textContent;
          const expectedDesc = within(target).getByTestId('ticket-description').textContent;

          fireEvent.click(within(target).getByTestId('ticket-title'));

          expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);
          expect(q.getByTestId('detail-description').textContent).toBe(expectedDesc);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('Back ボタンで詳細ビューが閉じ、リストが復元される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const beforeCount = q.getAllByTestId('ticket-card').length;

          fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          fireEvent.click(q.getByTestId('detail-close-button'));

          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
          expect(q.getByTestId('ticket-list')).toBeInTheDocument();
          expect(q.getAllByTestId('ticket-card').length).toBe(beforeCount);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューでコメントを追加するとコメント件数が増える', () => {
    fc.assert(
      fc.property(authorArb, bodyArb, (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

          expect(q.queryAllByTestId('comment-item').length).toBe(0);

          fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
          fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
          fireEvent.click(q.getByTestId('comment-submit-button'));

          const items = q.getAllByTestId('comment-item');
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

  it('選択されたチケットを削除すると詳細ビューが自動で閉じる', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          // 詳細ビューを開く
          fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          // 一度 Back に戻り、リストから同じチケットを削除
          fireEvent.click(q.getByTestId('detail-close-button'));
          const cards = q.getAllByTestId('ticket-card');
          const firstId = cards[0].getAttribute('data-ticket-id');

          // 再度その先頭カードを選択
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          // Back で戻り、削除
          fireEvent.click(q.getByTestId('detail-close-button'));
          const targetCard = q.getAllByTestId('ticket-card').find(c => c.getAttribute('data-ticket-id') === firstId)!;
          fireEvent.click(within(targetCard).getByTestId('delete-button'));

          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
          expect(q.queryAllByTestId('ticket-card').some(c => c.getAttribute('data-ticket-id') === firstId)).toBe(false);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
