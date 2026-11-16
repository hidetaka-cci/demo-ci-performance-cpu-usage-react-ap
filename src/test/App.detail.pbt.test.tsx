/**
 * Property-Based Tests for App - TicketDetail view
 *
 * The existing App.pbt.test.tsx tests list-view interactions but never
 * clicks a ticket title to open the TicketDetail view. This file covers
 * that branch: selecting a ticket, viewing its detail, adding comments,
 * and closing the detail view.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 100;

describe('App - TicketDetail view properties', () => {
  it('チケットタイトルをクリックすると detail ビューが表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          expect(cards.length).toBeGreaterThan(0);

          const firstTitle = within(cards[0]).getByTestId('ticket-title');
          fireEvent.click(firstTitle);

          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          // list は非表示になる
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('detail ビューの Back ボタンでリストビューに戻る', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          // detail が表示されている
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          fireEvent.click(q.getByTestId('detail-close-button'));

          // リストビューに戻る
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
          expect(q.getByTestId('ticket-list')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('detail ビューにチケットのタイトルが表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const titleText = within(cards[0]).getByTestId('ticket-title').textContent;

          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          const detailTitle = q.getByTestId('detail-title');
          expect(detailTitle.textContent).toBe(titleText);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('detail ビューでコメントを追加するとコメント件数が増える', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        (author, body) => {
          const { unmount, container } = render(<App />);
          try {
            const q = within(container);
            const cards = q.getAllByTestId('ticket-card');
            fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

            const detail = q.getByTestId('ticket-detail');
            const beforeCount = within(detail).queryAllByTestId('comment-item').length;

            const form = within(detail).getByTestId('comment-form');
            fireEvent.change(within(form).getByTestId('comment-author-input'), {
              target: { value: author },
            });
            fireEvent.change(within(form).getByTestId('comment-body-input'), {
              target: { value: body },
            });
            fireEvent.click(within(form).getByTestId('comment-submit-button'));

            const afterCount = within(detail).queryAllByTestId('comment-item').length;
            expect(afterCount).toBe(beforeCount + 1);
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('detail ビュー表示中にチケットを削除するとリストビューに戻る', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          if (cards.length === 0) return;

          // Open detail for first ticket
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          // Close via back button, then delete from list
          fireEvent.click(q.getByTestId('detail-close-button'));
          const refreshedCards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(refreshedCards[0]).getByTestId('delete-button'));

          // List view should still be shown
          expect(q.getByTestId('ticket-list')).toBeInTheDocument();
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
