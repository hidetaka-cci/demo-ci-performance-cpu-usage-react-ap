/**
 * Property-Based Integration Tests for App detail-view flow
 *
 * Covers the "ticket detail view" workflow which was previously untested:
 *   - Selecting a ticket via title click switches to the detail view
 *   - "Close" (Back) button returns to the list view
 *   - Adding a comment through the detail view updates the comment count
 *
 * These paths correspond to App.tsx lines 73-75 (handleAddComment),
 * line 90 (selectedTicket lookup), and line 116 (onClose reset).
 *
 * ※ try/finally + within(container) で DOM リークを防止します。
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 30;

const nonEmptyStrArb = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);

describe('App - detail view interaction properties', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          expect(cards.length).toBeGreaterThan(0);

          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          // ticket-list はリストビューだけの要素なので詳細ビューでは消える
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューの Close (Back) ボタンでリストビューに戻る', () => {
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

  it('詳細ビューから有効なコメントを追加するとコメント件数が1増える', () => {
    fc.assert(
      fc.property(nonEmptyStrArb, nonEmptyStrArb, (author, body) => {
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
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューでは選択中チケットの title と description が表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          const cardTitle = within(cards[0]).getByTestId('ticket-title').textContent;

          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

          const detailTitle = q.getByTestId('detail-title').textContent;
          expect(detailTitle).toBe(cardTitle);
          expect(q.getByTestId('detail-description')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
