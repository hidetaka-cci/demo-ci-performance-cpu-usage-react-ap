/**
 * Unit tests for App.tsx ticket-detail flow.
 *
 * Covers the code paths that are exercised only when a ticket is
 * "selected" and the TicketDetail view is rendered:
 *  - resolving the selected ticket from the tickets array
 *  - closing the detail view via the Back button
 *  - submitting a comment through handleAddComment
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket detail flow (coverage)', () => {
  it('clicking a ticket title opens the detail view for that ticket', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const titleText = within(firstCard).getByTestId('ticket-title').textContent;

      // Detail view must not be visible until a title is clicked.
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      expect(within(detail).getByTestId('detail-title').textContent).toBe(titleText);
      // List view is hidden while detail is open.
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('clicking Back on the detail view returns to the list view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      // Sanity: we are on the detail view.
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      expect(q.getByTestId('ticket-list')).toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  it('submitting a comment while a ticket is selected appends it to the comment list', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      // Initially there are no comments for this ticket.
      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: 'Alice' },
      });
      fireEvent.change(within(detail).getByTestId('comment-body-input'), {
        target: { value: 'Repro steps look correct.' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));

      const items = within(detail).getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Alice');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe(
        'Repro steps look correct.'
      );
    } finally {
      unmount();
    }
  });

  it('submitting a comment with empty author is a no-op (guard in CommentForm)', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      fireEvent.click(within(firstCard).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      fireEvent.change(within(detail).getByTestId('comment-body-input'), {
        target: { value: 'body only' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));

      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });
});
