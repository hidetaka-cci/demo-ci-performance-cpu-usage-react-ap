/**
 * Additional Property-Based Integration Tests for App component
 *
 * 既存の App.pbt.test.tsx はチケット選択 (TicketDetail 表示) 経路を触っていないため、
 * src/App.tsx の以下の未カバー行を補完する:
 *   - handleAddComment の本体 (73-75)
 *   - selectedTicket の `?? null` フォールバック (90)
 *   - TicketDetail の onClose (116)
 *
 * App 全体の render は重いので numRuns は小さめに設定する。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 10;

describe('App - detail view interaction properties', () => {
  it('チケットのタイトルをクリックすると TicketDetail が表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          expect(cards.length).toBeGreaterThan(0);

          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('TicketDetail の Back ボタンでチケット一覧に戻る', () => {
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

  it('TicketDetail でコメントを追加すると comment-item が1件増える', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        (author, body) => {
          const { unmount, container } = render(<App />);
          try {
            const q = within(container);
            const cards = q.getAllByTestId('ticket-card');
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
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });

  it('追加したコメントの author と body が TicketDetail に表示される', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        (author, body) => {
          const { unmount, container } = render(<App />);
          try {
            const q = within(container);
            const cards = q.getAllByTestId('ticket-card');
            fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

            fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
            fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
            fireEvent.click(q.getByTestId('comment-submit-button'));

            const authors = q.getAllByTestId('comment-author').map(el => el.textContent);
            const bodies = q.getAllByTestId('comment-body').map(el => el.textContent);
            expect(authors).toContain(author.trim());
            expect(bodies).toContain(body.trim());
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: NUM_RUNS }
    );
  });
});
