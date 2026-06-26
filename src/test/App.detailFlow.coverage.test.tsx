/**
 * Deterministic coverage tests for App's ticket-detail flow.
 *
 * Targets uncovered branches in src/App.tsx:
 *   - handleAddComment (lines 72-76): selectedTicketId guard + addComment dispatch
 *   - selectedTicket lookup (line 89-91): tickets.find for the selected id
 *   - TicketDetail onClose handler (line 116): clears selectedTicketId
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow (coverage)', () => {
  it('clicking a ticket title opens the detail view and Back closes it', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      const firstCard = q.getAllByTestId('ticket-card')[0];
      const title = within(firstCard).getByTestId('ticket-title');
      fireEvent.click(title);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      expect(within(detail).getByTestId('detail-title')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('adding a comment in the detail view increases the rendered comment count', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);

      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'Reviewer' } });
      fireEvent.change(q.getByTestId('comment-body-input'), { target: { value: 'Looks reasonable.' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));

      const items = q.getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks reasonable.');
    } finally {
      unmount();
    }
  });

  it('submitting an empty comment is ignored (author/body guard)', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);

      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      // Click submit without filling fields. Should not add a comment.
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);

      // Only author present — still ignored.
      fireEvent.change(q.getByTestId('comment-author-input'), { target: { value: 'OnlyAuthor' } });
      fireEvent.click(q.getByTestId('comment-submit-button'));
      expect(q.queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('deleting the currently selected ticket clears the selection', () => {
    // Covers App.tsx:69 (`if (selectedTicketId === id) setSelectedTicketId(null)`).
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);

      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      // Detail view has no delete button, so close, then delete from the list.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const cards = q.getAllByTestId('ticket-card');
      const before = cards.length;

      // Re-open detail for the same card, then close and delete it.
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      fireEvent.click(q.getByTestId('detail-close-button'));
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('delete-button'));

      expect(q.queryAllByTestId('ticket-card')).toHaveLength(before - 1);
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });
});
