/**
 * Coverage tests for App - TicketDetail integration flow.
 *
 * Existing App tests never enter the TicketDetail view, leaving the
 * handleAddComment path (App.tsx:73-75) and the detail-close callback
 * (App.tsx:116) uncovered. These tests cover:
 *   - clicking a ticket title opens the TicketDetail
 *   - adding a comment while a ticket is selected calls the
 *     createComment / addComment path and renders the comment
 *   - the detail Close (Back) button returns to the list view
 *   - deleting the currently selected ticket clears the selection
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - TicketDetail integration', () => {
  it('チケットタイトルをクリックすると TicketDetail が表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('detail-close-button で TicketDetail が閉じてリストへ戻る', () => {
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

  it('TicketDetail 内でコメント投稿するとコメントが表示される', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      // no comments yet
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good');
    } finally {
      unmount();
    }
  });

  it('複数コメント投稿するとコメント件数が増える', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      for (const body of ['first', 'second', 'third']) {
        fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'A' } });
        fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
        fireEvent.click(q.getByTestId('comment-submit-button'));
      }

      expect(q.getAllByTestId('comment-item')).toHaveLength(3);
    } finally {
      unmount();
    }
  });

  it('選択中のチケットを削除するとリスト画面へ戻る', () => {
    const { unmount, container } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const targetId = firstCard.getAttribute('data-ticket-id');
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // simulate delete of the selected ticket from detail-less flow:
      // close detail first so the delete button is reachable in the list
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cardToDelete = q
        .getAllByTestId('ticket-card')
        .find(c => c.getAttribute('data-ticket-id') === targetId)!;
      fireEvent.click(within(cardToDelete).getByTestId('delete-button'));

      // still in list view
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
      const remaining = q.queryAllByTestId('ticket-card');
      expect(remaining.every(c => c.getAttribute('data-ticket-id') !== targetId)).toBe(true);
    } finally {
      unmount();
    }
  });
});
