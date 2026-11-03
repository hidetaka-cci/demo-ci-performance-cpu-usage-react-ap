import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';

const NUM_RUNS = 50;

const nonEmptyStr = (max = 100) =>
  fc.string({ minLength: 1, maxLength: max }).filter(s => s.trim().length > 0);

describe('App - detail view flow', () => {
  it('チケットタイトルをクリックするとチケット詳細が表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const titles = q.getAllByTestId('ticket-title');
          expect(titles.length).toBeGreaterThan(0);

          fireEvent.click(titles[0]);

          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
          expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
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
          const q = within(container);
          fireEvent.click(q.getAllByTestId('ticket-title')[0]);

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

  it('詳細ビューでコメントを追加するとコメントが表示される', () => {
    fc.assert(
      fc.property(nonEmptyStr(30), nonEmptyStr(100), (author, body) => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          fireEvent.click(q.getAllByTestId('ticket-title')[0]);

          const detail = q.getByTestId('ticket-detail');
          const dq = within(detail);

          fireEvent.change(dq.getByTestId('comment-author-input'), {
            target: { value: author },
          });
          fireEvent.change(dq.getByTestId('comment-body-input'), {
            target: { value: body },
          });
          fireEvent.click(dq.getByTestId('comment-submit-button'));

          const commentItems = dq.getAllByTestId('comment-item');
          expect(commentItems.length).toBeGreaterThanOrEqual(1);
          const lastComment = commentItems[commentItems.length - 1];
          expect(within(lastComment).getByTestId('comment-author').textContent).toBe(
            author.trim()
          );
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('選択中のチケットを削除すると詳細ビューが閉じてリストに戻る', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const cards = q.getAllByTestId('ticket-card');
          expect(cards.length).toBeGreaterThan(0);

          // Open detail view for first ticket
          fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
          expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

          // Go back to list and delete the first ticket
          fireEvent.click(q.getByTestId('detail-close-button'));
          const updatedCards = q.getAllByTestId('ticket-card');
          fireEvent.click(within(updatedCards[0]).getByTestId('delete-button'));

          // After delete, list should still be shown (not detail view)
          expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
          expect(q.getByTestId('ticket-list')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });

  it('詳細ビューにはチケットのタイトルと説明が表示される', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { unmount, container } = render(<App />);
        try {
          const q = within(container);
          const firstTitle = q.getAllByTestId('ticket-title')[0].textContent;

          fireEvent.click(q.getAllByTestId('ticket-title')[0]);

          const detail = q.getByTestId('ticket-detail');
          expect(within(detail).getByTestId('detail-title').textContent).toBe(firstTitle);
          expect(within(detail).getByTestId('detail-description')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: NUM_RUNS }
    );
  });
});
