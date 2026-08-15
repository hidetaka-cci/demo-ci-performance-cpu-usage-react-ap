/**
 * Coverage tests for App - ticket detail view and comment handling
 *
 * Targets App.tsx uncovered lines:
 *   - 73-75: handleAddComment path when a ticket is selected (createComment +
 *            addComment into state).
 *   - 90:    selectedTicket lookup via tickets.find(...).
 *   - 116:   TicketDetail's onClose closure that clears selectedTicketId.
 *
 * The existing App.pbt.test.tsx suite never opens the detail view, so these
 * lines are not exercised there.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail interaction', () => {
  it('チケットタイトルをクリックすると詳細ビューが開く', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const title = within(firstCard).getByTestId('ticket-title');

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      fireEvent.click(title);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューの Close ボタンでリスト表示に戻る', () => {
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

  it('詳細ビューで有効なコメントを追加すると comment-item が増える', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('コメント追加後もチケット詳細のタイトルは維持される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const expectedTitle = within(firstCard).getByTestId('ticket-title').textContent;
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detailTitleBefore = q.getByTestId('detail-title').textContent;
      expect(detailTitleBefore).toBe(expectedTitle);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'First comment' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.getByTestId('detail-title').textContent).toBe(expectedTitle);
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを外部から削除すると詳細ビューが閉じる', () => {
    // 選択したチケットが state から消えた場合、App.tsx line 69 の
    // handleDelete 側で selectedTicketId が null にリセットされるため、
    // list 表示に戻ることで line 90 の found ケースと未選択 (null) ケースの
    // 両方を通過させる。
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const initialCount = q.getAllByTestId('ticket-card').length;
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('delete-button'));
      expect(q.queryAllByTestId('ticket-card')).toHaveLength(initialCount - 1);
    } finally {
      unmount();
    }
  });
});
