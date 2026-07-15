/**
 * Integration tests targeting uncovered branches in App.tsx:
 * - Lines 73-75: handleAddComment (invoked while a ticket is selected)
 * - Line 116:    onClose={() => setSelectedTicketId(null)}  (detail → list)
 *
 * The App PBT suite never opens the TicketDetail view, so the
 * comment-adding path and the detail close path are never covered.
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - detail view interactions', () => {
  it('カードタイトルをクリックすると TicketDetail が表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const title = within(firstCard).getByTestId('ticket-title');
      fireEvent.click(title);
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail の Back ボタンでリスト表示に戻る', () => {
    const { container, unmount } = render(<App />);
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

  it('detail 表示中にコメントを追加するとコメント数が増える', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), {
        target: { value: 'Frankie' },
      });
      fireEvent.change(q.getByTestId('comment-body-input'), {
        target: { value: 'Reproduced on staging as well.' },
      });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Frankie');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe(
        'Reproduced on staging as well.'
      );
    } finally {
      unmount();
    }
  });

  it('空 author / body のコメント送信は onAddComment を発火させない', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      fireEvent.change(q.getByTestId('comment-body-input'), {
        target: { value: 'body only' },
      });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('detail の一つのチケットに追加したコメントは他チケットに漏れない', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      // Open the first ticket, add a comment
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      fireEvent.change(q.getByTestId('comment-author-input'), {
        target: { value: 'Author A' },
      });
      fireEvent.change(q.getByTestId('comment-body-input'), {
        target: { value: 'Comment on first ticket' },
      });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.getAllByTestId('comment-item')).toHaveLength(1);

      // Return to the list
      fireEvent.click(q.getByTestId('detail-close-button'));

      // Open a different ticket; its comment list should be empty
      const otherCards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(otherCards[1]).getByTestId('ticket-title'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });
});
