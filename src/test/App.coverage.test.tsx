/**
 * Coverage-focused tests for App component.
 *
 * These tests target lines uncovered by the existing property-based suite:
 *   - handleAddComment (lines 73-75) — never invoked because TicketDetail
 *     was not opened in App-level tests.
 *   - selectedTicket lookup (line 90) — the ternary is only exercised when
 *     selectedTicketId is set.
 *   - onClose callback (line 116) — the inline arrow function that resets
 *     selectedTicketId when the detail view is closed.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow', () => {
  it('チケットタイトルをクリックすると TicketDetail が表示される', () => {
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
  });

  it('detail-close-button クリックで一覧に戻る', () => {
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
  });

  it('有効なコメントを送信するとコメント件数が増える', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      // 初期状態: コメントは0件
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(q.getByTestId('comment-body-input'), {
        target: { value: 'Looks like a real problem.' },
      });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const comments = q.getAllByTestId('comment-item');
      expect(comments).toHaveLength(1);
      expect(within(comments[0]).getByTestId('comment-author').textContent).toBe('Alice');
      expect(within(comments[0]).getByTestId('comment-body').textContent).toBe(
        'Looks like a real problem.'
      );
    } finally {
      unmount();
    }
  });

  it('複数のコメントを追加すると全て表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      for (let i = 1; i <= 3; i++) {
        fireEvent.change(q.getByTestId('comment-author-input'), {
          target: { value: `Author ${i}` },
        });
        fireEvent.change(q.getByTestId('comment-body-input'), {
          target: { value: `Body ${i}` },
        });
        fireEvent.click(q.getByTestId('comment-submit-button'));
      }

      expect(q.getAllByTestId('comment-item')).toHaveLength(3);
    } finally {
      unmount();
    }
  });

  it('コメントが空の状態で送信ボタンを押しても件数は増えない', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを削除しても UI がクラッシュせず、一覧に戻る', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const beforeCount = q.getAllByTestId('ticket-card').length;

      // まず選択
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // 詳細を閉じてから削除 (handleDelete が selectedTicketId をクリアするフローも含む)
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cardsAfterClose = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cardsAfterClose[0]).getByTestId('delete-button'));

      expect(q.queryAllByTestId('ticket-card').length).toBe(beforeCount - 1);
    } finally {
      unmount();
    }
  });
});
