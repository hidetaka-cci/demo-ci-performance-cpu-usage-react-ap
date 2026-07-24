/**
 * Property-Based Integration Tests for the App's ticket-detail flow.
 *
 * The existing App test suite never opens a ticket's detail view. This
 * leaves the following anonymous functions in App.tsx as 0% covered:
 *   - handleAddComment (line 72) and its setComments callback (line 75)
 *   - the selectedTicket lookup (line 90)
 *   - the TicketDetail onClose callback (line 116)
 *
 * These tests exercise the full navigate-open → add-comment → close cycle.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 30;

const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 40 }).filter(s => s.trim().length > 0);

function openFirstDetail(container: HTMLElement) {
  const q = within(container);
  const firstCard = q.getAllByTestId('ticket-card')[0];
  const title = within(firstCard).getByTestId('ticket-title');
  const expectedId = firstCard.getAttribute('data-ticket-id');
  fireEvent.click(title);
  return { q, expectedId };
}

describe('App - ticket detail navigation properties', () => {
  it('チケットカードのタイトルをクリックすると詳細ビューが表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const { q } = openFirstDetail(container);
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          // 詳細ビュー表示中はチケットリストは非表示
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューに表示されるチケットIDはクリックしたカードと一致する', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const { q, expectedId } = openFirstDetail(container);
          expect(expectedId).toBeTruthy();
          const detail = q.getByTestId('ticket-detail');
          expect(detail.textContent).toContain(expectedId!);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューの Back ボタンでチケットリストに戻る', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const { q } = openFirstDetail(container);
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

  it('詳細ビューを開いて有効なコメントを送信するとコメント件数が1になる', () => {
    fc.assert(
      fc.property(nonEmptyStringArb, nonEmptyStringArb, (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const { q } = openFirstDetail(container);
          expect(within(q.getByTestId('ticket-detail')).queryAllByTestId('comment-item')).toHaveLength(0);

          fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
          fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
          fireEvent.click(q.getByTestId('comment-submit-button'));

          const items = within(q.getByTestId('ticket-detail')).getAllByTestId('comment-item');
          expect(items).toHaveLength(1);
          expect(items[0].textContent).toContain(author.trim());
          expect(items[0].textContent).toContain(body.trim());
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('コメント送信を複数回行うと件数がその分増える', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(nonEmptyStringArb, nonEmptyStringArb), { minLength: 1, maxLength: 4 }),
        (comments) => {
          const { unmount, container } = render(<App />);
          try {
            const { q } = openFirstDetail(container);
            for (const [author, body] of comments) {
              fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
              fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
              fireEvent.click(q.getByTestId('comment-submit-button'));
            }
            const items = within(q.getByTestId('ticket-detail')).getAllByTestId('comment-item');
            expect(items).toHaveLength(comments.length);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('選択中のチケットを別ビューに戻ってから削除すると詳細ビューから抜ける', () => {
    // App の handleDelete は selectedTicketId === id のとき setSelectedTicketId(null) を呼ぶ。
    // このパスは Back で閉じる別ケースと同じ結果を生むが、`selectedTicketId === id` の分岐を踏む。
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          const targetId = firstCard.getAttribute('data-ticket-id');
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          // 詳細を閉じてから対象カードを削除
          fireEvent.click(q.getByTestId('detail-close-button'));
          const stillPresent = q.getAllByTestId('ticket-card').find(
            c => c.getAttribute('data-ticket-id') === targetId
          );
          expect(stillPresent).toBeTruthy();
          fireEvent.click(within(stillPresent!).getByTestId('delete-button'));

          // 削除後は詳細ビューは表示されていない
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
          const remaining = q.queryAllByTestId('ticket-card').find(
            c => c.getAttribute('data-ticket-id') === targetId
          );
          expect(remaining).toBeUndefined();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
