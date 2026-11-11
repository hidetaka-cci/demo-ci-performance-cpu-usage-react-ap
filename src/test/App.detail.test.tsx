/**
 * Integration tests for the ticket detail view in App.
 *
 * Covers the branches that the PBT suite misses because those tests
 * never click a ticket title to enter the detail view:
 *   - App.tsx:90  selectedTicket computation (truthy branch)
 *   - App.tsx:116 TicketDetail onClose prop rendered
 *   - App.tsx:73-75 handleAddComment body
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('チケットタイトルをクリックすると詳細ビューが表示されリストが非表示になる', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();

      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('詳細ビューの Back ボタンでリスト表示に戻る', () => {
    const { container, unmount } = render(<App />);
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
  });

  it('詳細ビューでコメントを送信するとコメントが追加される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      const form = q.getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'Test comment content' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      expect(q.getAllByTestId('comment-item')).toHaveLength(1);
      expect(q.getByTestId('comment-author').textContent).toBe('Alice');
    } finally {
      unmount();
    }
  });

  it('詳細ビューで複数のコメントを送信すると全て表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      const submitComment = (author: string, body: string) => {
        const form = q.getByTestId('comment-form');
        fireEvent.change(within(form).getByTestId('comment-author-input'), {
          target: { value: author },
        });
        fireEvent.change(within(form).getByTestId('comment-body-input'), {
          target: { value: body },
        });
        fireEvent.click(within(form).getByTestId('comment-submit-button'));
      };

      submitComment('Alice', 'First comment');
      submitComment('Bob', 'Second comment');

      expect(q.getAllByTestId('comment-item')).toHaveLength(2);
    } finally {
      unmount();
    }
  });

  it('詳細ビューの author が空の場合はコメントが追加されない', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      const form = q.getByTestId('comment-form');
      fireEvent.change(within(form).getByTestId('comment-body-input'), {
        target: { value: 'Body without author' },
      });
      fireEvent.click(within(form).getByTestId('comment-submit-button'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });
});
