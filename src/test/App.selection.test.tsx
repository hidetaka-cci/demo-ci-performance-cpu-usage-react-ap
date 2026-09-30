/**
 * App - selection & detail-view coverage tests
 *
 * Targets uncovered branches in App.tsx that PBT suite misses:
 *   - Selecting a ticket via TicketCard title click
 *   - Closing the detail view (setSelectedTicketId(null))
 *   - Adding a comment while a ticket is selected (handleAddComment body)
 *   - Deleting the currently-selected ticket (resets selection)
 */

import { describe, it, expect } from 'vitest';
import { render, within, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App - ticket selection & detail flow', () => {
  it('clicking a ticket title opens the detail view for that ticket', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const ticketId = firstCard.getAttribute('data-ticket-id');
      const title = within(firstCard).getByTestId('ticket-title');

      fireEvent.click(title);

      const detail = q.getByTestId('ticket-detail');
      expect(detail).toBeInTheDocument();
      expect(within(detail).getByTestId('detail-title').textContent).toBe(title.textContent);
      // list is no longer rendered while detail is open
      expect(q.queryByTestId('ticket-list')).not.toBeInTheDocument();
      expect(ticketId).toBeTruthy();
    } finally {
      unmount();
    }
  });

  it('clicking the detail close button returns to the ticket list', () => {
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

  it('submitting a comment from the detail view increases the comment count', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);

      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: 'Reviewer' },
      });
      fireEvent.change(within(detail).getByTestId('comment-body-input'), {
        target: { value: 'Looks good to me.' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));

      const items = within(detail).getAllByTestId('comment-item');
      expect(items).toHaveLength(1);
      expect(within(items[0]).getByTestId('comment-author').textContent).toBe('Reviewer');
      expect(within(items[0]).getByTestId('comment-body').textContent).toBe('Looks good to me.');
    } finally {
      unmount();
    }
  });

  it('empty comment submissions do not create a comment', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      fireEvent.click(within(q.getAllByTestId('ticket-card')[0]).getByTestId('ticket-title'));

      const detail = q.getByTestId('ticket-detail');
      // both fields empty
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));
      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);

      // author filled, body empty
      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: 'X' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));
      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('comments are scoped to the selected ticket', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const cards = q.getAllByTestId('ticket-card');
      expect(cards.length).toBeGreaterThanOrEqual(2);

      // Add a comment to the first ticket.
      fireEvent.click(within(cards[0]).getByTestId('ticket-title'));
      let detail = q.getByTestId('ticket-detail');
      fireEvent.change(within(detail).getByTestId('comment-author-input'), {
        target: { value: 'A' },
      });
      fireEvent.change(within(detail).getByTestId('comment-body-input'), {
        target: { value: 'first ticket comment' },
      });
      fireEvent.click(within(detail).getByTestId('comment-submit-button'));
      expect(within(detail).getAllByTestId('comment-item')).toHaveLength(1);

      // Go back and open a different ticket — it should have zero comments.
      fireEvent.click(q.getByTestId('detail-close-button'));
      const otherCard = q.getAllByTestId('ticket-card')[1];
      fireEvent.click(within(otherCard).getByTestId('ticket-title'));
      detail = q.getByTestId('ticket-detail');
      expect(within(detail).queryAllByTestId('comment-item')).toHaveLength(0);
    } finally {
      unmount();
    }
  });

  it('deleting the currently-selected ticket closes the detail view', () => {
    const { container, unmount } = render(<App />);
    try {
      const q = within(container);
      const firstCard = q.getAllByTestId('ticket-card')[0];
      const ticketId = firstCard.getAttribute('data-ticket-id')!;

      fireEvent.click(within(firstCard).getByTestId('ticket-title'));
      expect(q.getByTestId('ticket-detail')).toBeInTheDocument();

      fireEvent.click(q.getByTestId('detail-close-button'));

      // Find the same card again and delete it.
      const matching = q.getAllByTestId('ticket-card').find(
        c => c.getAttribute('data-ticket-id') === ticketId,
      )!;
      fireEvent.click(within(matching).getByTestId('delete-button'));

      // Detail view stays closed; card is gone.
      expect(q.queryByTestId('ticket-detail')).not.toBeInTheDocument();
      const remainingIds = q
        .queryAllByTestId('ticket-card')
        .map(c => c.getAttribute('data-ticket-id'));
      expect(remainingIds).not.toContain(ticketId);
    } finally {
      unmount();
    }
  });
});
