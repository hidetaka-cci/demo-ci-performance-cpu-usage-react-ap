/**
 * Tests targeting App.tsx integration flows currently uncovered:
 *   - Selecting a ticket via TicketCard title click (App line 90 find callback)
 *   - Adding a comment through TicketDetail (App line 72-75 handleAddComment)
 *   - Closing TicketDetail back to list (App line 116 onClose)
 *   - Deleting the selected ticket clears the selection (App line 69 branch)
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - detail view interactions', () => {
  it('clicking a ticket title opens the detail view for that ticket', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const firstCard = cards[0];
      const cardId = firstCard.getAttribute('data-ticket-id');
      const cardTitle = within(firstCard).getByTestId('ticket-title').textContent;

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      expect(q.getByTestId('detail-title').textContent).toBe(cardTitle);
      expect(cardId).toBeTruthy();
    } finally {
      unmount();
    }
  });

  it('detail view Close button returns to the ticket list', () => {
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

  it('submitting a comment through TicketDetail renders it in the comment list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      // No comments yet on this ticket
      expect(q.queryByTestId('comment-list')).not.toBeInTheDocument();

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks good to me' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      // handleAddComment produced a new comment for the selected ticket
      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me');
    } finally {
      unmount();
    }
  });

  it('submitting multiple comments appends them all', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      const submit = (author: string, body: string) => {
        fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: author } });
        fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: body } });
        fireEvent.click(q.getByTestId('comment-submit-button'));
      };

      submit('Alice', 'first');
      submit('Bob', 'second');
      submit('Carol', 'third');

      expect(q.getAllByTestId('comment-item')).toHaveLength(3);
    } finally {
      unmount();
    }
  });

  it('deleting the currently selected ticket clears the selection and returns to list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      const beforeCount = cards.length;
      const targetId = cards[0].getAttribute('data-ticket-id');
      expect(targetId).toBeTruthy();

      // Open detail for the first ticket
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Close detail so we can access the underlying card's delete button
      fireEvent.click(q.getByTestId('detail-close-button'));

      // Reopen to make it the "selected" ticket, then delete via list
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();
      fireEvent.click(q.getByTestId('detail-close-button'));

      // Delete the same ticket that was selected
      const cardToDelete = q.queryAllByTestId('ticket-card').find(
        c => c.getAttribute('data-ticket-id') === targetId
      );
      expect(cardToDelete).toBeTruthy();
      fireEvent.click(within(cardToDelete!).getByTestId('delete-button'));

      // Selection cleared: still on list view, count decreased
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.queryAllByTestId('ticket-card')).toHaveLength(beforeCount - 1);
    } finally {
      unmount();
    }
  });

  it('comment submit with empty author does not add a comment', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      // author blank, body filled
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'orphan comment' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      expect(q.queryByTestId('comment-item')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('comments do not leak across tickets (comments are scoped to selectedTicketId)', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      // Add a comment to ticket #1
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'A' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'on ticket 1' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.getAllByTestId('comment-item')).toHaveLength(1);
      fireEvent.click(q.getByTestId('detail-close-button'));

      // Open ticket #2 — should have no comments
      const cards2 = q.getAllByTestId('ticket-card');
      const other = cards2.find(c => c.getAttribute('data-ticket-id') !== cards[0].getAttribute('data-ticket-id'));
      expect(other).toBeTruthy();
      fireEvent.click(within(other!).getByTestId('ticket-title'));
      expect(q.queryByTestId('comment-item')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
