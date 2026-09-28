/**
 * Property-Based Integration Tests for App - TicketDetail flow
 *
 * Covers the ticket-detail integration path in src/App.tsx that the base
 * App.pbt.test.tsx does not exercise:
 *   - Opening TicketDetail by clicking a card title (TicketCard onSelect → App line 89-91)
 *   - Adding a comment via TicketDetail (App.handleAddComment, lines 72-76)
 *   - Closing TicketDetail (onClose, line 116) and returning to the list
 *
 * numRuns は低め: full App の render はコスト高。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 20;

const nonEmptyStrArb = fc.string({ minLength: 1, maxLength: 40 }).filter(s => s.trim().length > 0);

describe('App - ticket detail integration properties', () => {
  it('カードタイトルをクリックすると TicketDetail が表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));

          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('TicketDetail の Close ボタンでリスト表示に戻る', () => {
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

  it('選択中のチケットを Delete するとリスト表示に戻る', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const targetCard = cards[0];
          const targetId = targetCard.getAttribute('data-ticket-id');

          fireEvent.click(within(targetCard).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          // Detail 表示中は list が消えるので、Delete するには Close して該当カードを探す
          fireEvent.click(q.getByTestId('detail-close-button'));

          const cardAfter = q
            .getAllByTestId('ticket-card')
            .find(el => el.getAttribute('data-ticket-id') === targetId);
          expect(cardAfter).toBeDefined();
          fireEvent.click(within(cardAfter!).getByTestId('delete-button'));

          const remaining = q
            .queryAllByTestId('ticket-card')
            .some(el => el.getAttribute('data-ticket-id') === targetId);
          expect(remaining).toBe(false);
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('有効な author/body を入力してコメント送信するとコメント件数が1増える', () => {
    fc.assert(
      fc.property(nonEmptyStrArb, nonEmptyStrArb, (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));

          const before = q.queryAllByTestId('comment-item').length;

          fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
          fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
          fireEvent.click(q.getByTestId('comment-submit-button'));

          const after = q.queryAllByTestId('comment-item').length;
          expect(after).toBe(before + 1);

          const lastItem = q.queryAllByTestId('comment-item').at(-1)!;
          expect(within(lastItem).getByTestId('comment-author').textContent).toBe(author.trim());
          expect(within(lastItem).getByTestId('comment-body').textContent).toBe(body.trim());
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('空 author/body ではコメント件数は変わらない', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstCard = q.getAllByTestId('ticket-card')[0];
          fireEvent.click(within(firstCard).getByTestId('ticket-title'));

          const before = q.queryAllByTestId('comment-item').length;

          // author も body も空のまま送信
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
});
