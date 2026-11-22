/**
 * Integration tests for App - ticket detail view workflow
 *
 * Covers previously untested paths in App.tsx:
 *   - Lines 73-75: handleAddComment (selectedTicketId is set → creates & stores comment)
 *   - Line 90:     selectedTicket computation (ternary true-branch when a ticket is selected)
 *   - Line 116:    onClose callback (() => setSelectedTicketId(null))
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail view', () => {
  it('チケットタイトルをクリックするとdetail viewが表示されリストが非表示になる', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail viewのCloseボタンでリストに戻る', () => {
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

  it('detail viewでコメントを追加するとコメントがリストに表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const dq = within(detail);

      expect(dq.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(dq.getByTestId('comment-author-input'), { target: { value: 'Alice' } });
      fireEvent.change(dq.getByTestId('comment-body-input'), { target: { value: 'First comment' } });
      fireEvent.click(dq.getByTestId('comment-submit-button'));

      expect(dq.queryAllByTestId('comment-item')).toHaveLength(1);
      expect(dq.getByTestId('comment-body').textContent).toBe('First comment');
    } finally {
      unmount();
    }
  });

  it('複数コメントを追加するとすべて表示される', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      const dq = within(detail);

      for (const text of ['Comment A', 'Comment B']) {
        fireEvent.change(dq.getByTestId('comment-author-input'), { target: { value: 'Author' } });
        fireEvent.change(dq.getByTestId('comment-body-input'), { target: { value: text } });
        fireEvent.click(dq.getByTestId('comment-submit-button'));
      }

      expect(dq.queryAllByTestId('comment-item')).toHaveLength(2);
    } finally {
      unmount();
    }
  });

  it('detail view表示中に別チケットを選択すると切り替わる', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      const firstTitle = q.getByTestId('detail-title').textContent;

      fireEvent.click(q.getByTestId('detail-close-button'));

      const updatedCards = q.getAllByTestId('ticket-card');
      fireEvent.click(within(updatedCards[1]).getByTestId('ticket-title'));
      const secondTitle = q.getByTestId('detail-title').textContent;

      expect(firstTitle).not.toBe(secondTitle);
    } finally {
      unmount();
    }
  });
});
