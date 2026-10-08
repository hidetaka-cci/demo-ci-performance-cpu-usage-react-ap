/**
 * Targeted unit tests for App.tsx uncovered lines.
 *
 * Covers:
 * - Line 90: `selectedTicket` branch that finds a ticket by id after selection.
 * - Lines 73-75: `handleAddComment` (early-return guard + createComment + addComment).
 * - Line 116: `onClose={() => setSelectedTicketId(null)}` restoring the list view.
 *
 * The PBT suite never selects a ticket, so the entire detail-view branch of
 * App.tsx was dead to the coverage tool.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view flow', () => {
  it('チケットタイトルを選択すると detail view が表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      // 初期描画では list view
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();

      // 初期チケットの最初の TicketCard のタイトルをクリック
      const titles = q.getAllByTestId('ticket-title');
      expect(titles.length).toBeGreaterThan(0);
      fireEvent.click(titles[0]);

      // detail view が表示されリスト側は消える
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail view の Back ボタンで list view に戻る', () => {
    const { container, unmount } = render(<App />);
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
  });

  it('detail view でコメントを追加するとコメント一覧に反映される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      // 初期状態ではコメントなし
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(q.getByTestId('comment-body-input'), {
        target: { value: 'Looking into this now.' },
      });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Alice');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe(
        'Looking into this now.'
      );
    } finally {
      unmount();
    }
  });

  it('複数のコメントを順に追加するとすべて detail に表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(q.getAllByTestId('ticket-title')[0]);

      const addComment = (author: string, body: string) => {
        fireEvent.change(q.getByTestId('comment-author-input'), {
          target: { value: author },
        });
        fireEvent.change(q.getByTestId('comment-body-input'), {
          target: { value: body },
        });
        fireEvent.click(q.getByTestId('comment-submit-button'));
      };

      addComment('Alice', 'First comment');
      addComment('Bob', 'Second comment');

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(2);
    } finally {
      unmount();
    }
  });
});
